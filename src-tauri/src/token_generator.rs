use base64;
use base64::{engine::general_purpose, Engine as _};
use chrono::{Duration, TimeZone, Utc};
use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use parse_duration::parse;
use serde::Deserialize;
use serde::Serialize;
use serde_json::{Map, Value};
use std::error::Error;

enum JwtAlgorithm {
    RS256,
    RS384,
    RS512,
    HS256,
    HS384,
    HS512,
    ES256,
    ES384,
    ES512,
}

impl JwtAlgorithm {
    fn from_str(alg: &str) -> Option<Self> {
        match alg {
            "RS256" => Some(JwtAlgorithm::RS256),
            "RS384" => Some(JwtAlgorithm::RS384),
            "RS512" => Some(JwtAlgorithm::RS512),
            "HS256" => Some(JwtAlgorithm::HS256),
            "HS384" => Some(JwtAlgorithm::HS384),
            "HS512" => Some(JwtAlgorithm::HS512),
            "ES256" => Some(JwtAlgorithm::ES256),
            "ES384" => Some(JwtAlgorithm::ES384),
            "ES512" => Some(JwtAlgorithm::ES512),
            _ => None,
        }
    }

    fn to_algorithm(&self) -> Algorithm {
        match self {
            JwtAlgorithm::RS256 => Algorithm::RS256,
            JwtAlgorithm::RS384 => Algorithm::RS384,
            JwtAlgorithm::RS512 => Algorithm::RS512,
            JwtAlgorithm::HS256 => Algorithm::HS256,
            JwtAlgorithm::HS384 => Algorithm::HS384,
            JwtAlgorithm::HS512 => Algorithm::HS512,
            JwtAlgorithm::ES256 | JwtAlgorithm::ES384 | JwtAlgorithm::ES512 => {
                unreachable!("ECDSA algorithms are handled by the OpenSSL ECDSA signer")
            }
        }
    }
}

#[derive(Serialize, Deserialize)]
enum KeyKind {
    RSA,
    HMAC,
    EC,
}

#[derive(Serialize, Deserialize)]
pub struct KeyConfig {
    kind: KeyKind,
    base64_encoded: bool,
    passphrase: Option<String>,
    key_data: String,
}

fn parse_expiration(exp_str: &str) -> Result<Duration, Box<dyn Error>> {
    let std_duration = parse(exp_str)?;
    Ok(Duration::from_std(std_duration)?)
}

pub fn generate_token(
    mut claims: Map<String, Value>,
    expires_in: &str,
    key_config: &KeyConfig,
    alg_str: &str,
) -> Result<(String, String), Box<dyn Error>> {
    let now = Utc::now().timestamp() as usize;
    claims.insert("iat".to_string(), Value::from(now));

    let duration = parse_expiration(expires_in)?;

    let exp = (Utc::now() + duration).timestamp() as usize;
    claims.insert("exp".to_string(), Value::from(exp));

    let jwt_algo =
        JwtAlgorithm::from_str(alg_str).ok_or(format!("Invalid algorithm {}", alg_str))?;

    let exp_datetime = Utc.timestamp_opt(exp as i64, 0).unwrap();
    let exp_iso = exp_datetime.to_rfc3339();

    if matches!(
        jwt_algo,
        JwtAlgorithm::ES256 | JwtAlgorithm::ES384 | JwtAlgorithm::ES512
    ) {
        let token = sign_ecdsa(&claims, key_config, &jwt_algo)?;
        return Ok((token, exp_iso));
    }

    let header = Header {
        alg: jwt_algo.to_algorithm(),
        ..Default::default()
    };

    let encoding_key = match key_config.kind {
        KeyKind::RSA => {
            let pem = if key_config.base64_encoded {
                let decoded_bytes = general_purpose::STANDARD.decode(key_config.key_data.trim())?;
                String::from_utf8(decoded_bytes)?
            } else {
                key_config.key_data.clone()
            };

            if let Some(ref passphrase) = key_config.passphrase {
                use openssl::rsa::Rsa;
                let rsa =
                    Rsa::private_key_from_pem_passphrase(pem.as_bytes(), passphrase.as_bytes())?;
                let der = rsa.private_key_to_der()?;
                EncodingKey::from_rsa_der(&der)
            } else {
                EncodingKey::from_rsa_pem(pem.as_bytes())?
            }
        }
        KeyKind::HMAC => {
            let secret = if key_config.base64_encoded {
                let decoded_bytes = general_purpose::STANDARD.decode(key_config.key_data.trim())?;
                decoded_bytes
            } else {
                key_config.key_data.as_bytes().to_vec()
            };
            EncodingKey::from_secret(&secret)
        }
        KeyKind::EC => {
            unreachable!("EC keys are handled by the OpenSSL ECDSA signer")
        }
    };

    let token = encode(&header, &claims, &encoding_key)?;

    Ok((token, exp_iso))
}

fn read_der_integer(der: &[u8], start: usize) -> Result<(usize, Vec<u8>), Box<dyn Error>> {
    let mut j = start;
    if der.get(j) != Some(&0x02) {
        return Err("invalid ECDSA signature: expected DER INTEGER".into());
    }
    j += 1;
    let len = *der.get(j).ok_or("invalid DER integer length")? as usize;
    j += 1;
    let val = der.get(j..j + len).ok_or("invalid DER integer value")?;
    j += len;
    let trimmed: Vec<u8> = val.iter().copied().skip_while(|&b| b == 0).collect();
    Ok((j, trimmed))
}

fn der_signature_to_jws_rs(
    der: &[u8],
    coord_size: usize,
) -> Result<Vec<u8>, Box<dyn Error>> {
    let mut i = 0;
    if der.get(i) != Some(&0x30) {
        return Err("invalid ECDSA signature: expected DER SEQUENCE".into());
    }
    i += 1;
    let first_len_byte = *der.get(i).ok_or("invalid DER: missing length")?;
    i += 1;
    if first_len_byte & 0x80 != 0 {
        i += (first_len_byte & 0x7f) as usize;
    }
    let (j, r) = read_der_integer(der, i)?;
    let (_, s) = read_der_integer(der, j)?;

    let pad = |v: &[u8]| -> Result<Vec<u8>, Box<dyn Error>> {
        if v.len() > coord_size {
            return Err(format!("ECDSA coordinate larger than {} bytes", coord_size).into());
        }
        let mut out = vec![0u8; coord_size - v.len()];
        out.extend_from_slice(v);
        Ok(out)
    };
    let mut rs = pad(&r)?;
    rs.extend(pad(&s)?);
    Ok(rs)
}

fn sign_ecdsa(
    claims: &Map<String, Value>,
    key_config: &KeyConfig,
    alg: &JwtAlgorithm,
) -> Result<String, Box<dyn Error>> {
    use openssl::hash::MessageDigest;
    use openssl::pkey::PKey;
    use openssl::sign::Signer;

    let (digest, coord_size, algorithm_name): (MessageDigest, usize, &str) = match alg {
        JwtAlgorithm::ES256 => (MessageDigest::sha256(), 32, "ES256"),
        JwtAlgorithm::ES384 => (MessageDigest::sha384(), 48, "ES384"),
        JwtAlgorithm::ES512 => (MessageDigest::sha512(), 66, "ES512"),
        _ => return Err("non-ECDSA algorithm routed to ECDSA signer".into()),
    };

    let pem = if key_config.base64_encoded {
        let decoded = general_purpose::STANDARD.decode(key_config.key_data.trim())?;
        String::from_utf8(decoded)?
    } else {
        key_config.key_data.clone()
    };

    let pkey = if let Some(ref pass) = key_config.passphrase {
        if pass.is_empty() {
            PKey::private_key_from_pem(pem.as_bytes())?
        } else {
            PKey::private_key_from_pem_passphrase(pem.as_bytes(), pass.as_bytes())?
        }
    } else {
        PKey::private_key_from_pem(pem.as_bytes())?
    };

    let header_json = serde_json::json!({ "alg": algorithm_name, "typ": "JWT" });
    let header_bytes = serde_json::to_vec(&header_json)?;
    let claims_bytes = serde_json::to_vec(claims)?;

    let b64 = |bytes: &[u8]| general_purpose::URL_SAFE_NO_PAD.encode(bytes);
    let signing_input = format!("{}.{}", b64(&header_bytes), b64(&claims_bytes));

    let mut signer = Signer::new(digest, &pkey)?;
    signer.update(signing_input.as_bytes())?;
    let der_sig = signer.sign_to_vec()?;

    let rs = der_signature_to_jws_rs(&der_sig, coord_size)?;

    Ok(format!("{}.{}", signing_input, b64(&rs)))
}

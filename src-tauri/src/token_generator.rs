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
        }
    }
}

#[derive(Serialize, Deserialize)]
enum KeyKind {
    RSA,
    HMAC,
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
    };

    let token = encode(&header, &claims, &encoding_key)?;
    let exp_datetime = Utc.timestamp_opt(exp as i64, 0).unwrap();
    let exp_iso = exp_datetime.to_rfc3339();

    Ok((token, exp_iso))
}

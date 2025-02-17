mod token_generator;

use serde_json::Map;
use serde_json::Value;
use token_generator::generate_token;
use token_generator::KeyConfig;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn generate_token_command(
    claims: Map<String, Value>,
    expires_in: &str,
    key_config: KeyConfig,
    alg_str: &str,
) -> Result<(String, String), String> {
    generate_token(claims, expires_in, &key_config, alg_str)
        .map_err(|err| format!("error generating token: {}", err))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_token_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

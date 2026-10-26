/// The shell owns no logic: the UI is the web package, the window is undecorated
/// and the web top bar draws its own controls.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running Nithya Studio");
}

// Keeps a release build on Windows from opening a console next to the window.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    nithya_studio_lib::run()
}

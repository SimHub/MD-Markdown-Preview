import Cocoa

final class EditorIntegration {
    private let defaults: UserDefaults
    init(defaults: UserDefaults = .standard) { self.defaults = defaults }
    var selected: String { defaults.string(forKey: "PreferredEditor") ?? "vscode" }
    var customPath: String? { defaults.string(forKey: "CustomEditorPath") }
    func select(_ editor: String) {
        guard ["vscode", "neovim", "custom"].contains(editor) else { return }
        defaults.set(editor, forKey: "PreferredEditor")
    }
    func setCustomApp(_ url: URL) { defaults.set(url.path, forKey: "CustomEditorPath"); select("custom") }
    static func shellQuote(_ value: String) -> String { "'" + value.replacingOccurrences(of: "'", with: "'\\''") + "'" }
    static func neovimScript(executable: URL, document: URL) -> String {
        """
        #!/bin/zsh
        /bin/rm -f -- "$0"
        export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
        cd -- \(shellQuote(document.deletingLastPathComponent().path)) || exit 1
        exec \(shellQuote(executable.path)) -- \(shellQuote(document.path))

        """
    }
    static func neovimExecutable() -> URL? {
        let user = FileManager.default.homeDirectoryForCurrentUser
        let paths = ["/opt/homebrew/bin/nvim", "/usr/local/bin/nvim", user.appendingPathComponent(".local/bin/nvim").path, user.appendingPathComponent(".local/share/bob/nvim-bin/nvim").path]
        return paths.first(where: { FileManager.default.isExecutableFile(atPath: $0) }).map { URL(fileURLWithPath: $0) }
    }
    func open(_ document: URL, completion: @escaping (String) -> Void) {
        guard FileManager.default.isReadableFile(atPath: document.path) else { completion("Datei nicht erreichbar · SSD verbunden?"); return }
        if selected == "neovim" {
            guard let executable = Self.neovimExecutable() else { completion("Neovim nicht gefunden. Erwartet z. B. unter /opt/homebrew/bin/nvim."); return }
            guard let terminal = NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.apple.Terminal") else { completion("Terminal konnte nicht gefunden werden."); return }
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent("MDPreview-Editors", isDirectory: true)
            let script = directory.appendingPathComponent(UUID().uuidString + ".command")
            do {
                try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
                try Self.neovimScript(executable: executable, document: document).write(to: script, atomically: true, encoding: .utf8)
                try FileManager.default.setAttributes([.posixPermissions: 0o700], ofItemAtPath: script.path)
                NSWorkspace.shared.open([script], withApplicationAt: terminal, configuration: NSWorkspace.OpenConfiguration()) { _, error in
                    if error != nil { try? FileManager.default.removeItem(at: script) }
                    DispatchQueue.main.async { completion(error == nil ? "In Neovim geöffnet · nach dem Speichern aktualisiert sich die Vorschau" : "Neovim konnte nicht gestartet werden.") }
                }
            } catch { completion("Neovim konnte nicht vorbereitet werden: " + error.localizedDescription) }
            return
        }
        let application: URL?
        if selected == "custom", let path = customPath { application = URL(fileURLWithPath: path) }
        else { application = NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.microsoft.VSCode") }
        guard let application = application else { completion("VS Code nicht gefunden. Unter ⚙ einen anderen Editor wählen."); return }
        if Bundle(url: application)?.bundleIdentifier == Bundle.main.bundleIdentifier { completion("Bitte eine Editor-App statt MD Preview auswählen."); return }
        NSWorkspace.shared.open([document], withApplicationAt: application, configuration: NSWorkspace.OpenConfiguration()) { _, error in
            DispatchQueue.main.async { completion(error == nil ? "Im Editor geöffnet · nach dem Speichern aktualisiert sich die Vorschau" : "Editor konnte nicht geöffnet werden. Unter ⚙ die App prüfen.") }
        }
    }
}

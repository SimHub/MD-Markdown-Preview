import Cocoa

@main
struct EditorWatcherTests {
    static func main() throws {
        let root = FileManager.default.temporaryDirectory.appendingPathComponent("MDPreview-Tests-" + UUID().uuidString)
        try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
        defer { try? FileManager.default.removeItem(at: root) }
        let file = root.appendingPathComponent("notes ' $HOME `id` $(echo injected).md")
        try "first".write(to: file, atomically: false, encoding: .utf8)
        let script = root.appendingPathComponent("test.command")
        try EditorIntegration.neovimScript(executable: URL(fileURLWithPath: "/bin/echo"), document: file).write(to: script, atomically: true, encoding: .utf8)
        let process = Process(); process.executableURL = URL(fileURLWithPath: "/bin/zsh"); process.arguments = [script.path]
        let output = Pipe();process.standardOutput = output
        try process.run();process.waitUntilExit()
        let printed = String(data: output.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8)!
        assert(process.terminationStatus == 0 && printed.contains(file.path))
        assert(!FileManager.default.fileExists(atPath: script.path))

        let watcher = DocumentWatcher()
        var events = 0
        watcher.watch(file) { events += 1 }
        func waitForEvent(after baseline: Int) {
            let deadline = Date().addingTimeInterval(3)
            while events == baseline && Date() < deadline { RunLoop.main.run(until: Date().addingTimeInterval(0.03)) }
            assert(events > baseline, "No filesystem change delivered")
        }
        try "normal save".write(to: file, atomically: false, encoding: .utf8)
        waitForEvent(after: 0)
        let prior = events
        try "atomic replacement".write(to: file, atomically: true, encoding: .utf8)
        waitForEvent(after: prior)
        let saved = try String(contentsOf: file, encoding: .utf8)
        assert(saved == "atomic replacement")
        // Reattach after the atomic replacement, as the app's refresh callback does.
        watcher.watch(file) { events += 1 }
        let reattached = events
        try "saved after replacement".write(to: file, atomically: false, encoding: .utf8)
        waitForEvent(after: reattached)
        watcher.stop()
        let stopped = events
        try "no longer observed".write(to: file, atomically: false, encoding: .utf8)
        RunLoop.main.run(until: Date().addingTimeInterval(0.3));assert(events == stopped)
        print("OK: Editor-Aufruf mit Sonderzeichen, temporäres Startskript, normale/atomare Speichervorgänge und Watcher-Stopp.")
    }
}

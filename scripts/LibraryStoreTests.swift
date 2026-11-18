import Foundation

final class MemoryDefaults: UserDefaults {
    var values: [String:Any] = [:]
    init(memory: Bool) { super.init(suiteName: "MDPreview.MemoryTests")! }
    override func data(forKey key: String) -> Data? { values[key] as? Data }
    override func set(_ value: Any?, forKey key: String) { values[key] = value }
}
@main
struct LibraryStoreTests {
    static func main() {
        let defaults = MemoryDefaults(memory: true)
        let store = LibraryStore(defaults: defaults)
        assert(store.state.resumeOnLaunch)
        for i in 0..<20 { store.opened("/tmp/\(i).md") }
        assert(store.state.history.count == 15)
        assert(store.state.history.first?.path == "/tmp/19.md")
        store.opened("/tmp/10.md")
        assert(store.state.history.count == 15)
        assert(store.state.history.first?.path == "/tmp/10.md")
        store.toggleBookmark("/tmp/10.md")
        let position = ReadingPosition(heading:"Kapitel", occurrence:1, offset:42, progress:0.5, sourceProgress:0.2, view:"split")
        store.savePosition(position, for:"/tmp/10.md")
        store.savePosition(position, for:"/tmp/19.md")
        store.setResume(false)
        let reloaded = LibraryStore(defaults: defaults)
        assert(!reloaded.state.resumeOnLaunch)
        assert(reloaded.state.lastPath == "/tmp/10.md")
        assert(reloaded.state.positions["/tmp/10.md"]?.offset == 42)
        assert(reloaded.state.positions["/tmp/10.md"]?.view == "split")
        store.removeHistory("/tmp/19.md")
        assert(store.state.positions["/tmp/19.md"] == nil)
        store.clearHistory()
        assert(store.state.history.isEmpty)
        assert(store.state.lastPath == nil)
        assert(store.state.bookmarks.count == 1)
        assert(store.state.positions["/tmp/10.md"] != nil)
        store.savePosition(position, for:"/tmp/19.md")
        assert(store.state.positions["/tmp/19.md"] == nil)
        store.toggleBookmark("/tmp/10.md")
        assert(store.state.bookmarks.isEmpty)
        assert(store.state.positions.isEmpty)
        print("OK: 15 Verlaufseinträge, Duplikate, Lesezeichen, Persistenz, Lesestellen, Fortsetzen und gezieltes Löschen.")
    }
}

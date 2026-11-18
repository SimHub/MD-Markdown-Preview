import Foundation

final class ReviewMemory: UserDefaults {
    var values: [String:Any] = [:]
    init(memory: Bool) { super.init(suiteName: "MDPreview.ReviewTests")! }
    override func data(forKey key: String) -> Data? { values[key] as? Data }
    override func set(_ value: Any?, forKey key: String) { values[key] = value }
}
@main
struct ReviewStoreTests {
    static func main() {
        let memory = ReviewMemory(memory:true), store = ReviewStore(defaults:ReviewMemory(memory:true))
        let persistent = ReviewStore(defaults:memory)
        let key = ReviewStore.fingerprint(leftPath:"/a",rightPath:"/b",left:"one",right:"two")
        let changed = ReviewStore.fingerprint(leftPath:"/a",rightPath:"/b",left:"one",right:"updated")
        let swapped = ReviewStore.fingerprint(leftPath:"/b",rightPath:"/a",left:"two",right:"one")
        assert(key != changed && key != swapped)
        assert(persistent.save(ReviewNotes(comments:["h0":"Bitte Randfall prüfen"],reviewed:["h0"]),for:key))
        let reload = ReviewStore(defaults:memory)
        assert(reload.notes(for:key).comments["h0"] == "Bitte Randfall prüfen")
        assert(reload.notes(for:key).reviewed == ["h0"])
        assert(reload.notes(for:changed).comments.isEmpty)
        assert(!persistent.save(ReviewNotes(comments:["h0":String(repeating:"x",count:256001)]),for:key))
        assert(persistent.notes(for:key).comments["h0"] != nil)
        assert(persistent.save(ReviewNotes(),for:key))
        assert(ReviewStore(defaults:memory).notes(for:key).comments.isEmpty)
        for n in 0..<25 { store.save(ReviewNotes(comments:["h0":"note"]),for:String(n)) }
        assert(store.notes(for:"0").comments.isEmpty && !store.notes(for:"24").comments.isEmpty)
        print("OK: Review-Persistenz, Versionsbindung, Größenlimit, Löschen und Begrenzung auf 20 Reviews.")
    }
}

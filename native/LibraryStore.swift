import Foundation

struct ReadingPosition: Codable {
    var heading: String?
    var occurrence: Int = 0
    var offset: Double = 0
    var progress: Double = 0
    var sourceProgress: Double = 0
    var view: String = "preview"
}
struct FileEntry: Codable, Equatable {
    let path: String
    var name: String { URL(fileURLWithPath: path).lastPathComponent }
}
struct LibraryState: Codable {
    var history: [FileEntry] = []
    var bookmarks: [FileEntry] = []
    var positions: [String: ReadingPosition] = [:]
    var lastPath: String?
    var resumeOnLaunch = true
}
final class LibraryStore {
    private let defaults: UserDefaults
    private let key = "ReadingLibrary.v1"
    private(set) var state: LibraryState
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        state = defaults.data(forKey: key).flatMap { try? JSONDecoder().decode(LibraryState.self, from: $0) } ?? LibraryState()
    }
    private func persist() {
        let retained = Set((state.history + state.bookmarks).map(\.path))
        state.positions = state.positions.filter { retained.contains($0.key) }
        if let data = try? JSONEncoder().encode(state) { defaults.set(data, forKey: key) }
    }
    func opened(_ path: String) {
        state.history.removeAll { $0.path == path }
        state.history.insert(FileEntry(path: path), at: 0)
        state.history = Array(state.history.prefix(15))
        state.lastPath = path
        persist()
    }
    func toggleBookmark(_ path: String) {
        if state.bookmarks.contains(where: { $0.path == path }) { state.bookmarks.removeAll { $0.path == path } }
        else { state.bookmarks.append(FileEntry(path: path)) }
        persist()
    }
    func removeHistory(_ path: String) {
        state.history.removeAll { $0.path == path }
        if state.lastPath == path { state.lastPath = nil }
        persist()
    }
    func clearHistory() {
        state.history = []
        state.lastPath = nil
        persist()
    }
    func setResume(_ enabled: Bool) { state.resumeOnLaunch = enabled; persist() }
    func savePosition(_ position: ReadingPosition, for path: String) {
        guard (state.history + state.bookmarks).contains(where: { $0.path == path }) else { return }
        state.positions[path] = position
        persist()
    }
}

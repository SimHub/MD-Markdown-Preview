import Foundation

struct ComparisonSession: Codable {
    var left: String
    var right: String
    var mode: String
    var textLevel: String
    var leftScroll: Double
    var rightScroll: Double
    var diffScroll: Double
    var selectedHunk: Int
    var textIndex: Int
    var visible: Bool
    var area: String { mode.hasPrefix("documents-") ? "reading" : "diff" }
    var valid: Bool {
        ["documents-side","documents-stacked","unified","split"].contains(mode) &&
        ["off","words","chars","sentences","paragraphs"].contains(textLevel) &&
        [leftScroll,rightScroll,diffScroll].allSatisfy { $0.isFinite && $0 >= 0 && $0 < 1_000_000_000 } &&
        left.count < 16384 && right.count < 16384 && selectedHunk >= 0 && textIndex >= -1
    }
}
private struct ComparisonSessions: Codable {
    var reading: ComparisonSession?
    var diff: ComparisonSession?
    var activeArea: String?
}
final class ComparisonSessionsStore {
    private let defaults: UserDefaults
    private var state: ComparisonSessions
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        state = defaults.data(forKey:"LastComparisonSessions.v1").flatMap { try? JSONDecoder().decode(ComparisonSessions.self,from:$0) } ?? ComparisonSessions()
    }
    var activeArea: String? { state.activeArea }
    func session(for area: String) -> ComparisonSession? {
        let session = area == "reading" ? state.reading : state.diff
        return session?.valid == true ? session : nil
    }
    func save(_ session: ComparisonSession) {
        guard session.valid else { return }
        if session.left.isEmpty && session.right.isEmpty { clear(session.area); return }
        if session.area == "reading" { state.reading = session } else { state.diff = session }
        state.activeArea = session.visible ? session.area : nil
        persist()
    }
    func deactivate() { state.activeArea = nil; persist() }
    func clear(_ area: String) {
        if area == "reading" { state.reading = nil } else if area == "diff" { state.diff = nil }
        if state.activeArea == area { state.activeArea = nil }
        persist()
    }
    private func persist() { if let data = try? JSONEncoder().encode(state) { defaults.set(data,forKey:"LastComparisonSessions.v1") } }
}

import Foundation
import CryptoKit

struct ReviewNotes: Codable {
    var comments: [String: String] = [:]
    var reviewed: [String] = []
}
struct StoredReview: Codable {
    let key: String
    var notes: ReviewNotes
}
final class ReviewStore {
    private let defaults: UserDefaults
    private var entries: [StoredReview]
    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        entries = defaults.data(forKey: "FileReviews.v1").flatMap { try? JSONDecoder().decode([StoredReview].self, from: $0) } ?? []
    }
    static func fingerprint(leftPath: String, rightPath: String, left: String, right: String) -> String {
        let data = try! JSONEncoder().encode([leftPath, rightPath, left, right])
        return SHA256.hash(data: data).map { String(format: "%02x", $0) }.joined()
    }
    func notes(for key: String) -> ReviewNotes { entries.first(where: { $0.key == key })?.notes ?? ReviewNotes() }
    @discardableResult func save(_ notes: ReviewNotes, for key: String) -> Bool {
        guard let data = try? JSONEncoder().encode(notes), data.count <= 256_000, notes.comments.count <= 1000, notes.reviewed.count <= 1000 else { return false }
        entries.removeAll { $0.key == key }
        if !notes.comments.isEmpty || !notes.reviewed.isEmpty { entries.insert(StoredReview(key: key, notes: notes), at: 0) }
        entries = Array(entries.prefix(20))
        if let data = try? JSONEncoder().encode(entries) { defaults.set(data, forKey: "FileReviews.v1") }
        return true
    }
}

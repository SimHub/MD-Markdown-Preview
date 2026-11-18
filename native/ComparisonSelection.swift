import Foundation

/// One file fills the first empty slot; an explicit side replaces only that slot.
struct ComparisonSelection {
    var left: URL?
    var right: URL?
    mutating func insert(_ files: [URL], side: String? = nil) -> Bool {
        guard (1...2).contains(files.count) else { return false }
        if files.count == 2 { left = files[0]; right = files[1] }
        else if side == "left" { left = files[0] }
        else if side == "right" { right = files[0] }
        else if left == nil { left = files[0] }
        else { right = files[0] }
        return true
    }
}

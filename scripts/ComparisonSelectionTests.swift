import Foundation
@main struct ComparisonSelectionTests {
    static func main() {
        let a=URL(fileURLWithPath:"/a.md"),b=URL(fileURLWithPath:"/b.md"),c=URL(fileURLWithPath:"/c.md")
        var selected=ComparisonSelection()
        assert(selected.insert([a]));assert(selected.left==a && selected.right==nil)
        assert(selected.insert([b]));assert(selected.left==a && selected.right==b)
        assert(selected.insert([c],side:"left"));assert(selected.left==c && selected.right==b)
        assert(selected.insert([a],side:"right"));assert(selected.left==c && selected.right==a)
        assert(selected.insert([b]));assert(selected.left==c && selected.right==b)
        assert(selected.insert([a,b]));assert(selected.left==a && selected.right==b)
        assert(!selected.insert([]));assert(!selected.insert([a,b,c]));assert(selected.left==a && selected.right==b)
        selected=ComparisonSelection();assert(selected.insert([b],side:"right"));assert(selected.left==nil && selected.right==b)
        assert(selected.insert([a]));assert(selected.left==a && selected.right==b)
        print("OK: Einzelne Dateien nacheinander, rechte Seite zuerst, gezieltes Ersetzen, gemeinsames Öffnen und ungültige Auswahl.")
    }
}

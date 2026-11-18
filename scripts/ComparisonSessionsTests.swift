import Foundation
final class SessionMemory: UserDefaults {
    var values:[String:Any]=[:]
    init(memory:Bool){super.init(suiteName:"MDPreview.SessionTests")!}
    override func data(forKey key:String)->Data?{values[key] as? Data}
    override func set(_ value:Any?,forKey key:String){values[key]=value}
}
@main struct ComparisonSessionsTests {
    static func main(){
        let memory=SessionMemory(memory:true),store=ComparisonSessionsStore(defaults:SessionMemory(memory:true))
        let persistent=ComparisonSessionsStore(defaults:memory)
        let reading=ComparisonSession(left:"/a.md",right:"/b.md",mode:"documents-stacked",textLevel:"chars",leftScroll:1200,rightScroll:700,diffScroll:0,selectedHunk:0,textIndex:3,visible:true)
        persistent.save(reading)
        let diff=ComparisonSession(left:"/old.swift",right:"/new.swift",mode:"split",textLevel:"words",leftScroll:0,rightScroll:0,diffScroll:420,selectedHunk:2,textIndex:-1,visible:true)
        persistent.save(diff)
        let reloaded=ComparisonSessionsStore(defaults:memory)
        assert(reloaded.session(for:"reading")?.left=="/a.md")
        assert(reloaded.session(for:"reading")?.mode=="documents-stacked")
        assert(reloaded.session(for:"reading")?.rightScroll==700)
        assert(reloaded.session(for:"diff")?.selectedHunk==2)
        assert(reloaded.activeArea=="diff")
        reloaded.clear("reading")
        assert(reloaded.session(for:"reading")==nil && reloaded.session(for:"diff") != nil)
        assert(ComparisonSessionsStore(defaults:memory).session(for:"reading")==nil)
        var closed=diff;closed.visible=false;reloaded.save(closed);assert(reloaded.activeArea==nil)
        reloaded.save(diff);reloaded.deactivate();assert(reloaded.activeArea==nil && reloaded.session(for:"diff") != nil)
        var invalid=reading;invalid.mode="invalid";store.save(invalid);assert(store.session(for:"reading")==nil)
        invalid=reading;invalid.leftScroll = .nan;store.save(invalid);assert(store.session(for:"reading")==nil)
        invalid=reading;invalid.left="";invalid.right="";reloaded.save(invalid);assert(reloaded.session(for:"reading")==nil)
        print("OK: je eine letzte Sitzung, Neustart-Persistenz, Dateipaar/Ansicht/Scrollpositionen, selektives Löschen und deaktiviertes Auto-Fortsetzen.")
    }
}

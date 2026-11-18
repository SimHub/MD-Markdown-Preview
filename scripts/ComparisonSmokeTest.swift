import Cocoa
import WebKit

final class ComparisonTest: NSObject, WKScriptMessageHandler {
    var web: WKWebView!
    var window: NSWindow!
    var stage = 0
    let directory = URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("tmp/comparison")
    func start() {
        try! FileManager.default.createDirectory(at:directory,withIntermediateDirectories:true)
        let configuration = WKWebViewConfiguration()
        configuration.userContentController.add(self,name:"native")
        web = WKWebView(frame:NSRect(x:0,y:0,width:1180,height:820),configuration:configuration)
        window = NSWindow(contentRect:web.frame,styleMask:[.titled],backing:.buffered,defer:false)
        window.isReleasedWhenClosed = false
        window.contentView = web
        let page = URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("dist/MD Preview.app/Contents/Resources/web/index.html")
        web.loadFileURL(page,allowingReadAccessTo:page.deletingLastPathComponent())
    }
    func userContentController(_ userContentController:WKUserContentController,didReceive message:WKScriptMessage) {
        if (message.body as? [String:Any])?["action"] as? String == "ready" { render() }
    }
    func render() {
        let old = "import Foundation\n\nfunc greeting(name: String) -> String {\n    return \"Hello, \" + name\n}\n\nlet result = greeting(name: \"World\")\nprint(result)\n"
        let new = "import Foundation\n\nfunc greeting(name: String) -> String {\n    let trimmed = name.trimmingCharacters(in: .whitespaces)\n    guard !trimmed.isEmpty else { return \"Hallo!\" }\n    return \"Hallo, \\(trimmed)!\"\n}\n\nlet result = greeting(name: \"World\")\nprint(result)\n"
        let documentLeft = "# Projektplan\n\nEine klare Richtung für die nächste Version.\n\n## Ziele\n\n- Schnell öffnen und in Ruhe lesen.\n- Zwei unterschiedliche Dokumente gleichzeitig ansehen.\n- Die gewohnte Darstellung beibehalten.\n\n## Meilensteine\n\n| Schritt | Status |\n| --- | --- |\n| Konzept | Fertig |\n| Umsetzung | In Arbeit |\n| Prüfung | Geplant |\n\n" + String(repeating:"## Weiterdenken\n\nJedes Dokument hat seinen eigenen Platz. Die beiden Bereiche lassen sich unabhängig scrollen.\n\n",count:5)
        let documentRight = "# Notizen zum Lesen\n\n**Zwei Dateien, ein Überblick.**\n\n> Ein guter Vergleich beginnt damit, beide Texte vollständig zu sehen.\n\n## Ideen\n\nDiese Datei hat einen ganz anderen Inhalt als der Projektplan. Trotzdem bleibt die Darstellung angenehm ruhig.\n\n```swift\nlet ansicht = \"nebeneinander\"\n```\n\n" + String(repeating:"## Weitere Notizen\n\nMit der Ansicht untereinander bekommen breite Tabellen und längere Zeilen mehr Platz.\n\n",count:5)
        let nearLeft = "# Veröffentlichung\n\nWir veröffentlichen die neue Version am **Montag**.\n\nDer Zugang kostet **100 Euro** pro Jahr.\n\n## Ablauf\n\nDer Text wird zuerst geprüft. Danach veröffentlichen wir die Fassung.\n\nDieser Absatz bleibt in beiden Dateien gleich."
        let nearRight = "# Veröffentlichung\n\nWir veröffentlichen die neue Version am **Dienstag**.\n\nDer Zugang kostet **120 Euro** pro Jahr.\n\n## Ablauf\n\nDer Text wird zuerst gemeinsam geprüft. Danach veröffentlichen wir die Fassung.\n\nDieser Absatz bleibt in beiden Dateien gleich."
        let bookParagraphs=(0..<8500).map { "Absatz \($0). Elara betrachtet die Küste und denkt an ihren langen Weg zurück. " + String(repeating:"Ein ausführlicher Satz über die Reise und die nächsten Schritte. ",count:2) }
        var chapter=Array(bookParagraphs[100..<220]);chapter[7]=chapter[7].replacingOccurrences(of:"langen Weg",with:"neuen Weg");chapter[32]=chapter[32].replacingOccurrences(of:"Küste",with:"Stadt")
        let payload:[String:Any] = ["left":stage>=2 ? "/Projekt/Projektplan.md" : "/Projekt/vorher/Greeting.swift","right":stage>=2 ? "/Notizen/Lesen.md" : "/Projekt/nachher/Greeting.swift","old":stage>=8 ? bookParagraphs.joined(separator:"\n\n") : stage>=6 ? nearLeft : stage>=2 ? documentLeft : old,"new":stage>=8 ? chapter.joined(separator:"\n\n") : stage>=6 ? nearRight : stage>=2 ? documentRight : new,"key":"smoke","notes":["comments":["h0":"Randfall prüfen: Soll auch ein Name mit Zeilenumbruch als leer gelten?"],"reviewed":[]]]
        let script: String
        switch stage {
        case 0: script = "window.showComparison(payload);document.documentElement.dataset.theme='light';"
        case 1: script = "document.documentElement.dataset.theme='dark';window.setComparisonMode('split');"
        case 2: script = "window.openDualReading();window.showComparison(payload);document.documentElement.dataset.theme='light';"
        case 3: script = "document.documentElement.dataset.theme='dark';window.setComparisonMode('documents-stacked');"
        case 4: script = "window.openDualReading();window.setComparisonFiles({left:payload.left,right:''});window.showPartialComparison({left:payload.left,right:'',old:payload.old});document.documentElement.dataset.theme='light';"
        case 5: script = "window.setComparisonMode('unified');window.setComparisonFiles({left:'',right:payload.right});window.showPartialComparison({left:'',right:payload.right,new:payload.new});document.documentElement.dataset.theme='dark';"
        case 6: script = "window.openDualReading();window.showComparison(payload);document.documentElement.dataset.theme='light';document.querySelector('#text-compare-level').value='words';document.querySelector('#text-compare-level').dispatchEvent(new Event('change'));"
        case 7: script = "window.setComparisonMode('documents-stacked');document.documentElement.dataset.theme='dark';document.querySelector('#text-compare-level').value='chars';document.querySelector('#text-compare-level').dispatchEvent(new Event('change'));"
        case 8: script = "window.openDualReading();document.querySelector('#text-compare-level').value='words';window.showComparison(payload);document.documentElement.dataset.theme='light';if(!document.querySelector('#compare-summary').textContent.includes('118 gleich'))throw new Error(document.querySelector('#compare-summary').textContent);document.querySelector('#dual-scroll-left .relation-equal')?.scrollIntoView({block:'start'});"

        default: script = "const saved=window.flushComparisonSession();window.resetComparisonSession();window.prepareComparisonSession(saved);window.setComparisonFiles({left:saved.left,right:saved.right});window.showComparison(payload);if(document.querySelector('#compare-view').value!==saved.mode||document.querySelector('#text-compare-level').value!==saved.textLevel)throw new Error('Session settings lost');if(Math.abs(document.querySelector('#dual-scroll-left').scrollTop-saved.leftScroll)>2||Math.abs(document.querySelector('#dual-scroll-right').scrollTop-saved.rightScroll)>2)throw new Error('Session positions lost');"


        }
        let scrollTest = stage == 8 ? """
        const leftPane=document.querySelector('#dual-scroll-left'),rightPane=document.querySelector('#dual-scroll-right');
        const leftBadge=leftPane.querySelector('.relation-similar[data-label]'),relation=leftBadge.dataset.textRelation;
        leftBadge.scrollIntoView({block:'center'});
        const leftBefore=leftPane.scrollTop;
        rightPane.scrollTop=rightPane.scrollHeight-rightPane.clientHeight;
        leftBadge.click();
        await new Promise(resolve=>setTimeout(resolve,800));
        const rightBadge=rightPane.querySelector(`mark[data-text-relation="${relation}"][data-label]`);
        if(Math.abs(leftPane.scrollTop-leftBefore)>1||!rightBadge.classList.contains('text-relation-active'))throw new Error('Left-to-right navigation failed');
        if(Math.abs((leftBadge.getBoundingClientRect().top-leftPane.getBoundingClientRect().top)-(rightBadge.getBoundingClientRect().top-rightPane.getBoundingClientRect().top))>4)throw new Error('Counterpart not aligned');
        const rightBefore=rightPane.scrollTop;
        leftPane.scrollTop=leftPane.scrollHeight-leftPane.clientHeight;
        rightBadge.click();
        await new Promise(resolve=>setTimeout(resolve,800));
        if(Math.abs(rightPane.scrollTop-rightBefore)>1||!leftBadge.classList.contains('text-relation-active'))throw new Error('Right-to-left navigation failed');
        if(Math.abs((leftBadge.getBoundingClientRect().top-leftPane.getBoundingClientRect().top)-(rightBadge.getBoundingClientRect().top-rightPane.getBoundingClientRect().top))>4)throw new Error('Reverse counterpart not aligned');
        """ : ""
        web.callAsyncJavaScript(script + scrollTest + "await new Promise(resolve=>setTimeout(resolve,100));return {hunks:document.querySelectorAll('.diff-hunk').length,panes:document.querySelectorAll('.dual-scroll').length,marks:document.querySelectorAll('.text-change').length,overflow:document.documentElement.scrollWidth>innerWidth};",arguments:["payload":payload],in:nil,in:.page) { [weak self] result in
            guard let self = self,case .success(let raw) = result,let values = raw as? [String:Any],(self.stage < 2 ? (values["hunks"] as? Int) == 1 : (values["panes"] as? Int) == 2),(values["overflow"] as? Bool) == false,(self.stage<6 || (values["marks"] as? Int ?? 0)>0) else { print("FAIL: comparison rendering: \(result)");exit(1) }
            self.web.takeSnapshot(with:nil) { image,error in
                guard let image = image,let data = image.tiffRepresentation,let bitmap = NSBitmapImageRep(data:data),let png = bitmap.representation(using:.png,properties:[:]) else { print("FAIL: snapshot: \(String(describing:error))");exit(1) }
                let name = ["unified-light.png","split-dark.png","documents-side.png","documents-stacked.png","partial-reading.png","partial-diff.png","text-words.png","text-chars.png","large-manuscript.png","restored-session.png"][self.stage]
                try! png.write(to:self.directory.appendingPathComponent(name))
                if self.stage < 9 { self.stage += 1;self.render() }
                else { print("OK: WebKit-Diff und zwei vollständige Dokumente, Badge-Navigation und Wiederherstellung der letzten Sitzung am großen Manuskript, beide Lesepositionen erhalten.");exit(0) }
            }
        }
    }
}
@main struct ComparisonSmokeTest {
    static func main() {
        let app=NSApplication.shared;app.setActivationPolicy(.prohibited)
        let test=ComparisonTest();test.start()
        DispatchQueue.main.asyncAfter(deadline:.now()+30) { print("FAIL: comparison smoke test timed out");exit(1) }
        withExtendedLifetime(test){app.run()}
    }
}

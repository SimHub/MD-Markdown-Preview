import Cocoa
import WebKit
import PDFKit

// Export through the same WebKit print pipeline as the app; no printer or third-party PDF engine.
final class ExportTest: NSObject, WKScriptMessageHandler {
    var web: WKWebView!
    var window: NSWindow!
    let directory: URL
    let assets = AssetHandler()
    var phase = 0
    var batch: BatchPDFExporter?
    init(directory: URL) { self.directory = directory; super.init() }
    func start() {
        let config = WKWebViewConfiguration()
        config.userContentController.add(self, name: "native")
        assets.directory = directory
        config.setURLSchemeHandler(assets, forURLScheme: "mdasset")
        web = WKWebView(frame: NSRect(x:0,y:0,width:760,height:900), configuration:config)
        window = NSWindow(contentRect: NSRect(x:0,y:0,width:760,height:900), styleMask:[.titled], backing:.buffered, defer:false)
        window.contentView = web
        let page = URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("dist/MD Preview.app/Contents/Resources/web/index.html")
        web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as? [String:Any])?["action"] as? String == "ready" { runNext() }
    }
    func quoted(_ value:String)->String { String(data:try! JSONSerialization.data(withJSONObject:[value]),encoding:.utf8)!.dropFirst().dropLast().description }
    func runNext() {
        if phase == 2 { testBatch(combined: true); return }
        let plain = phase == 1
        var markdown = "# Export-Test\n\nEin Dokument mit **auswählbarem Text**, Umlauten: Grüße aus Köln.\n\n![Logo](test-image.png)\n\n"
        for i in 1...2 {
            markdown += "## Kapitel \(i)\n\n"
            markdown += String(repeating:"Ein ruhiger Lesetext mit ausreichend Platz. Absätze sollen sauber umbrechen und alle Inhalte vollständig enthalten. ",count:8) + "\n\n"
            markdown += "| Funktion | Ergebnis |\n| --- | --- |\n| Markdown | Saubere Darstellung |\n| Export | Helles A4-Layout |\n\n"
            markdown += "```typescript\nconst kapitel = \(i);\nconst langeZeile = \"" + String(repeating:"abcdef",count:25) + "\";\n```\n\n"
        }
        markdown += "ENDE-DES-DOKUMENTS\n"
        let text = plain ? "# Dies bleibt Klartext\n**Keine Formatierung**\n<kein HTML>\n\tEinrückung\n" + String(repeating:"Zeile mit Sonderzeichen: äöü & < >\n",count:70) + "TXT-ENDE" : markdown
        let name = plain ? "Notizen.txt" : "Test.md"
        let script = "window.documentBase='mdasset://test/';window.loadDocument(\(quoted(text)),\(quoted(name)),false,{path:'/test'});document.documentElement.dataset.theme='dark';document.querySelector('[data-view=source]').click();"
        web.evaluateJavaScript(script) { [weak self] _, error in
            guard let self = self, error == nil else { print("FAIL: loading test document: \(String(describing:error))"); exit(1) }
            self.web.callAsyncJavaScript("return await window.preparePDF()", arguments:[:], in:nil, in:.page) { result in
                guard case .success = result else { print("FAIL: preparing PDF: \(result)"); exit(1) }
                let destination = self.directory.appendingPathComponent(plain ? "plain.pdf" : "markdown.pdf")
                print("Starting print: \(name)");fflush(stdout)
                let operation = self.web.printOperation(with:PDFPrintSettings.make(destination:destination))
                operation.showsPrintPanel = false; operation.showsProgressPanel = false
                print("Print size: \(operation.printInfo.paperSize), area: \(operation.printInfo.imageablePageBounds)");fflush(stdout)
                operation.canSpawnSeparateThread = true
                operation.runModal(for: self.window, delegate:self, didRun:#selector(self.printFinished(_:success:context:)), contextInfo:nil)
            }
        }
    }
    func testBatch(combined: Bool) {
        do {
            let root = directory.appendingPathComponent("batch")
            if combined, FileManager.default.fileExists(atPath:root.path) { try FileManager.default.removeItem(at:root) }
            try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true)
            var files: [URL] = []
            for name in ["DREI", "EINS", "ZWEI"] {
                let folder = root.appendingPathComponent(name)
                try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
                let file = folder.appendingPathComponent("Kapitel.md")
                try ("# Kapitel " + name + "\n\nMARKER-" + name + "\n\n![Lokal](bild.png)\n").write(to:file,atomically:true,encoding:.utf8)
                try Data(contentsOf:directory.appendingPathComponent("test-image.png")).write(to:folder.appendingPathComponent("bild.png"))
                files.append(file)
            }
            let output = root.appendingPathComponent(combined ? "combined.pdf" : "single", isDirectory: !combined)
            if !combined {
                try FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
                // Existing files must never be overwritten by the batch exporter.
                try "KEEP-ME".write(to:output.appendingPathComponent("Kapitel.pdf"),atomically:true,encoding:.utf8)
            }
            let page = URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("dist/MD Preview.app/Contents/Resources/web/index.html")
            batch = BatchPDFExporter(files:files,destination:output,combined:combined,parent:window,resourcePage:page,progress:{ print($0) },completion:{ [weak self] message in
                guard let self = self else { exit(1) }
                print(message)
                if combined {
                    guard let pdf = PDFDocument(url:output),pdf.pageCount == 3 else { print("FAIL: merge page count");exit(1) }
                    for (index,marker) in ["DREI","EINS","ZWEI"].enumerated() { guard pdf.page(at:index)?.string?.contains("MARKER-"+marker) == true else { print("FAIL: merge order");exit(1) } }
                    self.batch = nil;DispatchQueue.main.async { self.testBatch(combined:false) }
                } else {
                    guard (try? String(contentsOf:output.appendingPathComponent("Kapitel.pdf"),encoding:.utf8)) == "KEEP-ME" else { print("FAIL: overwrote PDF");exit(1) }
                    for (index,marker) in ["DREI","EINS","ZWEI"].enumerated() { let url = output.appendingPathComponent("Kapitel (\(index+2)).pdf"); guard PDFDocument(url:url)?.string?.contains("MARKER-"+marker) == true else { print("FAIL: separate output");exit(1) } }
                    print("OK: Mehrdatei-Export, gewünschte Reihenfolge, 3 neue Seiten, lokale Bilder und Schutz vor Überschreiben.");exit(0)
                }
            })
            batch?.start()
        } catch { print("FAIL: batch fixture: \(error)");exit(1) }
    }
    @objc func printFinished(_ operation:NSPrintOperation,success:Bool,context:UnsafeMutableRawPointer?) {
        let plain = phase == 1
        let name = plain ? "Notizen.txt" : "Test.md"
        let destination = directory.appendingPathComponent(plain ? "plain.pdf" : "markdown.pdf")
                guard success, let pdf = PDFDocument(url:destination), let content = pdf.string else { print("FAIL: no PDF");exit(1) }
                guard pdf.pageCount > 1, content.contains(plain ? "TXT-ENDE" : "ENDE-DES-DOKUMENTS"), !content.contains("Zuletzt geöffnet"), !content.contains("Lokal. Einfach.") else { print("FAIL: missing content or UI leaked: \(content)");exit(1) }
                if plain { guard content.contains("**Keine Formatierung**"), content.contains("<kein HTML>") else { print("FAIL: TXT changed");exit(1) } }
                for index in 0..<pdf.pageCount {
                    let bounds = pdf.page(at:index)!.bounds(for:.mediaBox)
                    guard abs(bounds.width-595.28)<2,abs(bounds.height-841.89)<2 else { print("FAIL: not A4: \(bounds)");exit(1) }
                }
                print("\(name): \(pdf.pageCount) A4-Seiten, \(content.count) Zeichen")
                phase += 1; DispatchQueue.main.async { self.runNext() }
    }

}
@main
struct PDFSmokeTest {
    static func main() {
        let app = NSApplication.shared
        app.setActivationPolicy(.prohibited)
        let output = URL(fileURLWithPath:FileManager.default.currentDirectoryPath).appendingPathComponent("tmp/pdfs")
        try! FileManager.default.createDirectory(at:output,withIntermediateDirectories:true)
        let icon = NSImage(contentsOfFile:"native/AppIcon.icns")!
        let bitmap = NSBitmapImageRep(data:icon.tiffRepresentation!)!
        try! bitmap.representation(using:.png,properties:[:])!.write(to:output.appendingPathComponent("test-image.png"))
        let test = ExportTest(directory:output)
        test.start()
        DispatchQueue.main.asyncAfter(deadline:.now()+90) { print("FAIL: export timed out");exit(1) }
        withExtendedLifetime(test) { app.run() }
    }
}

import Cocoa
import WebKit
import PDFKit

/// Render one file at a time so local image folders and print pagination remain independent.
final class BatchPDFExporter: NSObject, WKScriptMessageHandler {
    let files: [URL]
    let destination: URL
    let combined: Bool
    let parent: NSWindow
    let completion: (String) -> Void
    let progress: (String) -> Void
    private let assets = AssetHandler()
    private let resourcePage: URL
    private var renderer: WKWebView!
    private var renderWindow: NSWindow!
    private var temporary: URL!
    private var index = 0
    private var completed = 0
    private var merged = PDFDocument()
    private var finished = false

    init(files: [URL], destination: URL, combined: Bool, parent: NSWindow,
         resourcePage: URL? = nil, progress: @escaping (String) -> Void, completion: @escaping (String) -> Void) {
        self.files = files; self.destination = destination; self.combined = combined
        self.parent = parent; self.progress = progress; self.completion = completion
        self.resourcePage = resourcePage ?? Bundle.main.resourceURL!.appendingPathComponent("web/index.html")
    }
    func start() {
        do {
            let directory = combined ? destination.deletingLastPathComponent() : destination
            temporary = directory.appendingPathComponent(".mdpreview-export-" + UUID().uuidString, isDirectory: true)
            try FileManager.default.createDirectory(at: temporary, withIntermediateDirectories: false)
            let configuration = WKWebViewConfiguration()
            configuration.userContentController.add(self, name: "native")
            configuration.setURLSchemeHandler(assets, forURLScheme: "mdasset")
            renderer = WKWebView(frame: NSRect(x: 0,y: 0,width: 760,height: 900), configuration: configuration)
            renderWindow = NSWindow(contentRect: renderer.frame, styleMask: [.titled], backing: .buffered, defer: false)
            renderWindow.isReleasedWhenClosed = false
            renderWindow.contentView = renderer
            let page = resourcePage
            renderer.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        } catch { finish("Export konnte nicht gestartet werden: " + error.localizedDescription) }
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as? [String: Any])?["action"] as? String == "ready" { next() }
    }
    private func next() {
        guard !finished else { return }
        guard index < files.count else {
            if combined {
                guard let data = merged.dataRepresentation() else { finish("Zusammengeführte PDF konnte nicht erstellt werden."); return }
                do { try data.write(to: destination, options: .atomic) }
                catch { finish("PDF konnte nicht gespeichert werden: " + error.localizedDescription); return }
            }
            finish(combined ? "PDF aus \(completed) Dateien gespeichert" : "\(completed) PDFs gespeichert")
            return
        }
        let file = files[index]
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath: file.path)
            guard (attributes[.size] as? NSNumber)?.intValue ?? 0 < 20_000_000 else { throw CocoaError(.fileReadTooLarge) }
            let content = try String(contentsOf: file, encoding: .utf8)
            assets.directory = file.deletingLastPathComponent()
            progress("PDF \(index + 1)/\(files.count) · \(file.lastPathComponent)")
            let values = ["content": content, "name": file.lastPathComponent, "base": "mdasset://" + UUID().uuidString.lowercased() + "/"]
            renderer.callAsyncJavaScript("window.documentBase=base;window.loadDocument(content,name);return await window.preparePDF();", arguments: values, in: nil, in: .page) { [weak self] result in
                guard let self = self else { return }
                guard case .success = result else { self.finishFailure(file); return }
                let operation = self.renderer.printOperation(with: PDFPrintSettings.make(destination: self.temporary.appendingPathComponent("part.pdf")))
                operation.canSpawnSeparateThread = true
                operation.showsPrintPanel = false; operation.showsProgressPanel = true
                operation.runModal(for: self.parent, delegate: self, didRun: #selector(self.printed(_:success:context:)), contextInfo: nil)
            }
        } catch { finishFailure(file) }
    }
    @objc private func printed(_ operation: NSPrintOperation, success: Bool, context: UnsafeMutableRawPointer?) {
        let part = temporary.appendingPathComponent("part.pdf")
        let file = files[index]
        guard success, let data = try? Data(contentsOf: part), let pdf = PDFDocument(data: data), pdf.pageCount > 0 else { finishFailure(file); return }
        do {
            if combined {
                for i in 0..<pdf.pageCount { if let page = pdf.page(at: i) { merged.insert(page, at: merged.pageCount) } }
                try FileManager.default.removeItem(at: part)
            } else {
                let target = Self.availableDestination(for: file, in: destination)
                // A move fails rather than overwriting if another process creates that name meanwhile.
                try FileManager.default.moveItem(at: part, to: target)
            }
            completed += 1; index += 1
            DispatchQueue.main.async { self.next() }
        } catch { finishFailure(file) }
    }
    static func availableDestination(for file: URL, in directory: URL) -> URL {
        let base = file.deletingPathExtension().lastPathComponent
        var candidate = directory.appendingPathComponent(base + ".pdf")
        var suffix = 2
        while FileManager.default.fileExists(atPath: candidate.path) {
            candidate = directory.appendingPathComponent("\(base) (\(suffix)).pdf"); suffix += 1
        }
        return candidate
    }
    private func finishFailure(_ file: URL) {
        let prefix = combined ? "Keine gemeinsame PDF gespeichert." : "\(completed) PDFs bereits gespeichert."
        finish(prefix + " Export abgebrochen bei „" + file.lastPathComponent + "“ – Datei prüfen oder erneut versuchen.")
    }
    private func finish(_ message: String) {
        guard !finished else { return }; finished = true
        renderer?.configuration.userContentController.removeScriptMessageHandler(forName: "native")
        renderer?.stopLoading(); renderWindow?.close()
        if let directory = temporary { try? FileManager.default.removeItem(at: directory) }
        completion(message)
    }
}

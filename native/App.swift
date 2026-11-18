import Cocoa
import WebKit
import UniformTypeIdentifiers

final class PreviewWebView: WKWebView {
    var openFiles: (([URL], NSPoint) -> Void)?
    override func draggingEntered(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }
    override func draggingUpdated(_ sender: NSDraggingInfo) -> NSDragOperation { .copy }
    override func performDragOperation(_ sender: NSDraggingInfo) -> Bool {
        guard let urls = sender.draggingPasteboard.readObjects(forClasses: [NSURL.self], options: [.urlReadingFileURLsOnly: true]) as? [URL] , !urls.isEmpty else { return false }
        let local = convert(sender.draggingLocation, from: nil)
        let point = NSPoint(x: local.x, y: isFlipped ? local.y : bounds.height - local.y)
        openFiles?(urls, point); return true
    }
}
final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate, NSWindowDelegate {
    var window: NSWindow!
    var web: PreviewWebView!
    let assets = AssetHandler()
    let library = LibraryStore()
    let editor = EditorIntegration()
    let documentWatcher = DocumentWatcher()
    let reviews = ReviewStore()
    let comparisonSessions = ComparisonSessionsStore()
    var comparisonArea = "diff"
    var comparisonLeft: URL?
    var comparisonRight: URL?
    var activeReviewKey: String?
    var comparisonVisible = false
    var current: URL?
    var pending: [URL] = []
    var openDocuments: [URL] = []
    var batchExporter: BatchPDFExporter?
    var lastContent = ""
    var ready = false
    var timer: Timer?
    var refreshing = false
    var exporting = false
    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(assets, forURLScheme: "mdasset")
        config.userContentController.add(self, name: "native")
        web = PreviewWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.openFiles = { [weak self] urls, point in
            guard let self = self else { return }
            if self.comparisonVisible {
                self.web.evaluateJavaScript("window.flushReview();window.flushComparisonSession();window.comparisonDropSide(\(point.x),\(point.y))") { [weak self] side,_ in
                    self?.insertComparison(urls, side: side as? String)
                }
            } else { self.openMany(urls) }
        }
        web.registerForDraggedTypes([.fileURL])
        window = NSWindow(contentRect: NSRect(x: 0,y: 0,width: 1180,height: 820),styleMask: [.titled,.closable,.miniaturizable,.resizable],backing: .buffered,defer: false)
        window.delegate = self
        window.title = "MD Preview"; window.minSize = NSSize(width: 720,height: 500)
        window.contentView = web; window.center(); window.setFrameAutosaveName("PreviewWindow")
        buildMenu()
        let page = Bundle.main.resourceURL!.appendingPathComponent("web/index.html")
        // Cached frontend resources must not survive a local app update.
        config.websiteDataStore.removeData(ofTypes: [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache], modifiedSince: .distantPast) { [weak self] in
            self?.web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        }
        window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true)
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.refresh() }
        let arguments = CommandLine.arguments.dropFirst().filter { !$0.hasPrefix("-") }
        if !arguments.isEmpty { pending = arguments.map { URL(fileURLWithPath: $0) } }
    }
    func buildMenu() {
        let menu = NSMenu()
        let app = NSMenuItem(); let appMenu = NSMenu(); appMenu.addItem(withTitle: "MD Preview beenden",action: #selector(NSApplication.terminate(_:)),keyEquivalent: "q");app.submenu = appMenu;menu.addItem(app)
        let file = NSMenuItem();let fileMenu = NSMenu(title:"Datei");let open = NSMenuItem(title:"Öffnen …",action:#selector(openDialog),keyEquivalent:"o");open.target = self;fileMenu.addItem(open);let editCurrent = NSMenuItem(title:"Im Editor öffnen",action:#selector(openInEditor),keyEquivalent:"e");editCurrent.target = self;fileMenu.addItem(editCurrent);let compare = NSMenuItem(title:"Dateien vergleichen …",action:#selector(openComparison),keyEquivalent:"d");compare.keyEquivalentModifierMask = [.command,.shift];compare.target = self;fileMenu.addItem(compare);let dual = NSMenuItem(title:"Zwei Dateien gleichzeitig lesen …",action:#selector(openDualReading),keyEquivalent:"2");dual.keyEquivalentModifierMask = [.command,.shift];dual.target = self;fileMenu.addItem(dual);let reload = NSMenuItem(title:"Neu laden",action:#selector(manualRefresh),keyEquivalent:"r");reload.target = self;fileMenu.addItem(reload);let pdf = NSMenuItem(title:"Als PDF exportieren …",action:#selector(exportPDF),keyEquivalent:"e");pdf.keyEquivalentModifierMask = [.command,.shift];pdf.target = self;fileMenu.addItem(pdf);fileMenu.addItem(withTitle:"Fenster schließen",action:#selector(NSWindow.performClose(_:)),keyEquivalent:"w");file.submenu = fileMenu;menu.addItem(file)
        let edit = NSMenuItem();let editMenu = NSMenu(title:"Bearbeiten");editMenu.addItem(withTitle:"Kopieren",action:#selector(NSText.copy(_:)),keyEquivalent:"c");editMenu.addItem(withTitle:"Alles auswählen",action:#selector(NSText.selectAll(_:)),keyEquivalent:"a");edit.submenu = editMenu;menu.addItem(edit)
        NSApp.mainMenu = menu
    }
    @objc func openDualReading() { openWorkspace(area:"reading") }
    @objc func openComparison() { openWorkspace(area:"diff") }
    func saveComparisonSnapshot(_ raw: Any?) {
        guard let raw = raw as? [String:Any], let data = try? JSONSerialization.data(withJSONObject:raw), let session = try? JSONDecoder().decode(ComparisonSession.self,from:data), session.left == (comparisonLeft?.path ?? ""), session.right == (comparisonRight?.path ?? "") else { return }
        comparisonArea = session.area
        comparisonSessions.save(session)
    }
    func openWorkspace(area: String) {
        guard ready, !exporting else { return }
        web.evaluateJavaScript("window.flushReview();window.flushComparisonSession()") { [weak self] snapshot,_ in
            guard let self = self else { return }
            self.saveComparisonSnapshot(snapshot)
            self.restoreWorkspace(area:area)
        }
    }
    func restoreWorkspace(area: String) {
        comparisonArea = area; comparisonVisible = true
        if let session = comparisonSessions.session(for:area) {
            comparisonLeft = session.left.isEmpty ? nil : URL(fileURLWithPath:session.left)
            comparisonRight = session.right.isEmpty ? nil : URL(fileURLWithPath:session.right)
            let json = String(data:try! JSONEncoder().encode(session),encoding:.utf8)!
            web.evaluateJavaScript("window.prepareComparisonSession(\(json))")
        } else {
            if comparisonLeft == nil { comparisonLeft = current }
            let script = area == "reading" ? "window.openDualReading()" : "window.openComparison();window.setComparisonMode('unified')"
            web.evaluateJavaScript(script)
        }
        sendComparisonFiles();compareFiles()
    }
    func sendComparisonFiles() {
        let data: [String: String] = ["left": comparisonLeft?.path ?? "", "right": comparisonRight?.path ?? ""]
        let json = String(data: try! JSONEncoder().encode(data), encoding: .utf8)!
        web.evaluateJavaScript("window.setComparisonFiles(\(json))")
    }
    func pickComparison(side: String?) {
        guard !exporting else { return }
        let panel = NSOpenPanel(); panel.allowsMultipleSelection = side == nil
        panel.canChooseDirectories = false
        panel.title = side == nil ? "Eine oder zwei Text- oder Codedateien auswählen" : "Datei zum Vergleichen auswählen"
        panel.prompt = "Auswählen"
        panel.beginSheetModal(for: window) { [weak self] result in
            guard let self = self, result == .OK else { return }
            self.web.evaluateJavaScript("window.flushReview();window.flushComparisonSession()") { [weak self] _,_ in
                self?.insertComparison(panel.urls, side: side)
            }
        }
    }
    func insertComparison(_ urls: [URL], side: String?) {
        guard !exporting else { return }
        var selection = ComparisonSelection(left: comparisonLeft, right: comparisonRight)
        guard selection.insert(urls, side: side) else { comparisonError("Bitte eine oder zwei Dateien auswählen bzw. hineinziehen."); return }
        comparisonLeft = selection.left; comparisonRight = selection.right
        sendComparisonFiles(); compareFiles()
    }
    func clearComparison(side: String) {
        guard !exporting else { return }
        if side == "left" { comparisonLeft = nil } else { comparisonRight = nil }
        activeReviewKey = nil
        sendComparisonFiles(); compareFiles()
    }
    func comparisonError(_ message: String) { web.evaluateJavaScript("window.comparisonError(\(jsString(message)))") }
    func compareFiles() {
        guard !exporting else { return }
        do {
            func read(_ url: URL) throws -> String {
                let size = try FileManager.default.attributesOfItem(atPath: url.path)[.size] as? NSNumber
                guard (size?.intValue ?? 0) <= 2_000_000 else { throw NSError(domain:"Comparison",code:1,userInfo:[NSLocalizedDescriptionKey:"Maximal 2 MB pro Vergleichsdatei."]) }
                let text = try String(contentsOf: url, encoding: .utf8)
                guard !text.contains("\0"), text.components(separatedBy: "\n").count <= 20_000 else { throw NSError(domain:"Comparison",code:2,userInfo:[NSLocalizedDescriptionKey:"Bitte UTF-8-Textdateien mit maximal 20.000 Zeilen wählen."]) }
                return text
            }
            guard let left = comparisonLeft, let right = comparisonRight else {
                activeReviewKey = nil
                let leftHost = "dual-" + UUID().uuidString.lowercased(), rightHost = "dual-" + UUID().uuidString.lowercased()
                assets.directories = [:]
                if let left = comparisonLeft { assets.directories[leftHost] = left.deletingLastPathComponent() }
                if let right = comparisonRight { assets.directories[rightHost] = right.deletingLastPathComponent() }
                struct Partial: Encodable { let left: String; let right: String; let old: String?; let new: String?; let leftBase: String; let rightBase: String }
                let payload = Partial(left:comparisonLeft?.path ?? "",right:comparisonRight?.path ?? "",old:try comparisonLeft.map { try read($0) },new:try comparisonRight.map { try read($0) },leftBase:"mdasset://\(leftHost)/",rightBase:"mdasset://\(rightHost)/")
                let json = String(data:try JSONEncoder().encode(payload),encoding:.utf8)!
                web.evaluateJavaScript("window.showPartialComparison(\(json))")
                return
            }
            let old = try read(left), new = try read(right)
            let key = ReviewStore.fingerprint(leftPath:left.path,rightPath:right.path,left:old,right:new)
            activeReviewKey = key
            let leftHost = "dual-" + UUID().uuidString.lowercased(), rightHost = "dual-" + UUID().uuidString.lowercased()
            assets.directories = [leftHost:left.deletingLastPathComponent(),rightHost:right.deletingLastPathComponent()]
            struct Payload: Encodable { let leftBase: String; let rightBase: String; let left: String; let right: String; let old: String; let new: String; let key: String; let notes: ReviewNotes }
            let payload = Payload(leftBase:"mdasset://\(leftHost)/",rightBase:"mdasset://\(rightHost)/",left:left.path,right:right.path,old:old,new:new,key:key,notes:reviews.notes(for:key))
            let json = String(data:try JSONEncoder().encode(payload),encoding:.utf8)!
            web.evaluateJavaScript("window.showComparison(\(json))")
        } catch { comparisonError("Vergleich nicht möglich: " + error.localizedDescription) }
    }
    @objc func openInEditor() {
        guard let url = current, !exporting else { return }
        editor.open(url) { [weak self] message in self?.showError(message) }
    }
    func chooseEditorApp() {
        let panel = NSOpenPanel(); panel.allowedContentTypes = [.application]
        panel.canChooseDirectories = false; panel.allowsMultipleSelection = false
        panel.title = "Editor-App auswählen"; panel.prompt = "Als Editor verwenden"
        panel.beginSheetModal(for: window) { [weak self] response in
            guard let self = self else { return }
            if response == .OK, let url = panel.url {
                if Bundle(url: url)?.bundleIdentifier == Bundle.main.bundleIdentifier { self.showError("Bitte eine Editor-App statt MD Preview auswählen.") }
                else { self.editor.setCustomApp(url) }
            }
            self.sendLibrary()
        }
    }
    @objc func openDialog() {
        let panel = NSOpenPanel();panel.allowedContentTypes = [UTType(filenameExtension:"md") ?? .plainText, UTType(filenameExtension:"markdown") ?? .plainText,.plainText];panel.allowsMultipleSelection = true
        panel.beginSheetModal(for:window) { [weak self] result in if result == .OK { self?.openMany(panel.urls) } }
    }
    func jsString(_ value: String) -> String { let data = try! JSONSerialization.data(withJSONObject:[value],options:[.fragmentsAllowed]);let encoded = String(data:data,encoding:.utf8)!;return String(encoded.dropFirst().dropLast()) }
    func load(_ url: URL) {
        guard !exporting else { showError("Bitte den laufenden Export abwarten."); return }
        guard ready else { pending.append(url);return }
        guard ["md","markdown","txt"].contains(url.pathExtension.lowercased()) else { showError("Bitte eine Markdown- oder Textdatei öffnen.");return }
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath:url.path)
            guard (attributes[.size] as? NSNumber)?.intValue ?? 0 < 20_000_000 else { showError("Die Datei ist zu groß (max. 20 MB).");return }
            let content = try String(contentsOf:url,encoding:.utf8)
            if !openDocuments.contains(where: { $0.standardizedFileURL == url.standardizedFileURL }) { openDocuments.append(url.standardizedFileURL) }
            current = url;documentWatcher.watch(url) { [weak self] in self?.refresh() };assets.directory = url.deletingLastPathComponent();lastContent = content
            library.opened(url.standardizedFileURL.path)
            sendLibrary()
            let options = DocumentOptions(path: url.standardizedFileURL.path, position: library.state.positions[url.standardizedFileURL.path])
            let optionsJSON = String(data: try JSONEncoder().encode(options), encoding: .utf8)!
            let documentBase = jsString("mdasset://\(UUID().uuidString.lowercased())/")
            web.evaluateJavaScript("window.documentBase=\(documentBase);window.loadDocument(\(jsString(content)),\(jsString(url.lastPathComponent)),false,\(optionsJSON))")
            window.title = url.lastPathComponent + " — MD Preview";window.representedURL = url
        } catch { showError("Datei kann nicht als UTF-8 gelesen werden.") }
    }
    func openMany(_ urls: [URL]) {
        guard !exporting else { showError("Bitte den laufenden Export abwarten."); return }
        guard ready else { pending.append(contentsOf: urls); return }
        let accepted = urls.filter { ["md", "markdown", "txt"].contains($0.pathExtension.lowercased()) }
        for url in accepted {
            let normalized = url.standardizedFileURL
            if !openDocuments.contains(normalized) { openDocuments.append(normalized) }
        }
        sendLibrary()
        if let first = accepted.first { load(first) }
        if accepted.count != urls.count { showError("Nur .md, .markdown und .txt werden geöffnet.") }
    }
    func beginBatchExport(paths: [String], combined: Bool) {
        guard ready, !exporting, !refreshing else { return }
        let allowed = Set(openDocuments.map { $0.path })
        var seen = Set<String>()
        let files = paths.filter { allowed.contains($0) && seen.insert($0).inserted }.map { URL(fileURLWithPath: $0) }
        guard !files.isEmpty else { showError("Bitte mindestens eine Datei auswählen."); return }
        exporting = true; web.evaluateJavaScript("window.setExporting(true)")
        if combined {
            let panel = NSSavePanel(); panel.allowedContentTypes = [.pdf]
            panel.title = "Gemeinsame PDF exportieren"; panel.nameFieldStringValue = "Zusammengefasst.pdf"; panel.prompt = "Exportieren"
            panel.beginSheetModal(for: window) { [weak self] response in
                guard let self = self else { return }
                guard response == .OK, let url = panel.url else { self.finishExport("Export abgebrochen"); return }
                self.runBatch(files, destination: url, combined: true)
            }
        } else {
            let panel = NSOpenPanel(); panel.canChooseFiles = false; panel.canChooseDirectories = true
            panel.canCreateDirectories = true; panel.prompt = "Hier exportieren"; panel.title = "Zielordner für einzelne PDFs wählen"
            panel.beginSheetModal(for: window) { [weak self] response in
                guard let self = self else { return }
                guard response == .OK, let url = panel.url else { self.finishExport("Export abgebrochen"); return }
                self.runBatch(files, destination: url, combined: false)
            }
        }
    }
    func runBatch(_ files: [URL], destination: URL, combined: Bool) {
        batchExporter = BatchPDFExporter(files: files, destination: destination, combined: combined, parent: window,
            progress: { [weak self] message in self?.showError(message) },
            completion: { [weak self] message in self?.finishExport(message); self?.batchExporter = nil })
        batchExporter?.start()
    }
    @objc func exportPDF() {
        guard ready, let url = current, !exporting, !refreshing, !comparisonVisible else { return }
        exporting = true
        web.evaluateJavaScript("window.setExporting(true)")
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.pdf]
        panel.nameFieldStringValue = url.deletingPathExtension().lastPathComponent + ".pdf"
        panel.title = "Als PDF exportieren"
        panel.prompt = "Exportieren"
        panel.beginSheetModal(for: window) { [weak self] response in
            guard let self = self else { return }
            guard response == .OK, let destination = panel.url else { self.finishExport("Export abgebrochen"); return }
            self.web.callAsyncJavaScript("return await window.preparePDF()", arguments: [:], in: nil, in: .page) { [weak self] result in
                guard let self = self else { return }
                guard case .success = result else { self.finishExport("PDF konnte nicht vorbereitet werden."); return }
                let info = PDFPrintSettings.make(destination: destination)
                let operation = self.web.printOperation(with: info)
                operation.canSpawnSeparateThread = true
                operation.showsPrintPanel = false
                operation.showsProgressPanel = true
                operation.runModal(for: self.window, delegate: self, didRun: #selector(self.pdfDidFinish(_:success:context:)), contextInfo: nil)
            }
        }
    }
    @objc func pdfDidFinish(_ operation: NSPrintOperation, success: Bool, context: UnsafeMutableRawPointer?) {
        finishExport(success ? "PDF gespeichert" : "PDF konnte nicht gespeichert werden.")
    }
    func finishExport(_ message: String) {
        exporting = false
        web.evaluateJavaScript("window.setExporting(false);window.showError(\(jsString(message)))")
    }
    @objc func manualRefresh() { refresh(force: true) }
    func applicationDidBecomeActive(_ notification: Notification) { refresh() }
    func refresh(force: Bool = false) {
        guard ready, let url = current, !refreshing, !exporting else { return }
        documentWatcher.watch(url) { [weak self] in self?.refresh() }
        if force {
            refreshing = true
            web.evaluateJavaScript("window.setRefreshing(true)")
            // Remove WebKit's HTTP image caches as well as Foundation's URL cache.
            // Cookies, local settings and reading history are preserved.
            URLCache.shared.removeAllCachedResponses()
            web.configuration.websiteDataStore.removeData(ofTypes: [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache], modifiedSince: .distantPast) { [weak self] in
                guard let self = self else { return }
                self.refreshing = false
                guard self.current == url else { self.web.evaluateJavaScript("window.setRefreshing(false)"); return }
                self.reloadDocument(url, force: true)
            }
        } else { reloadDocument(url, force: false) }
    }
    func reloadDocument(_ url: URL, force: Bool) {
        defer { if force { web.evaluateJavaScript("window.setRefreshing(false)") } }
        do {
            let attributes = try FileManager.default.attributesOfItem(atPath: url.path)
            guard (attributes[.size] as? NSNumber)?.intValue ?? 0 < 20_000_000 else { showError("Die Datei ist zu groß (max. 20 MB)."); return }
            let content = try String(contentsOf: url, encoding: .utf8)
            if force || content != lastContent {
                lastContent = content
                let options = force ? "{refreshImages:true}" : "{}"
                web.evaluateJavaScript("window.loadDocument(\(jsString(content)),\(jsString(url.lastPathComponent)),true,\(options))")
            }
        } catch { showError("Datei nicht lesbar · Datei verschoben, SSD getrennt oder kein UTF-8.") }
    }
    func showError(_ message:String) { web.evaluateJavaScript("window.showError(\(jsString(message)))") }
    struct DocumentOptions: Encodable { let path: String; let position: ReadingPosition? }
    struct LibraryPayload: Encodable {
        let history: [FileEntry]
        let bookmarks: [FileEntry]
        let resumeOnLaunch: Bool
        let current: String?
        let openFiles: [FileEntry]
        let editor: String
        let editorApp: String?
    }
    func sendLibrary() {
        let state = library.state
        let payload = LibraryPayload(history: state.history, bookmarks: state.bookmarks, resumeOnLaunch: state.resumeOnLaunch, current: current?.standardizedFileURL.path, openFiles: openDocuments.map { FileEntry(path: $0.path) }, editor: editor.selected, editorApp: editor.customPath.map { URL(fileURLWithPath: $0).deletingPathExtension().lastPathComponent })
        guard let data = try? JSONEncoder().encode(payload), let json = String(data: data, encoding: .utf8) else { return }
        web.evaluateJavaScript("window.updateLibrary(\(json))")
    }
    struct SearchMatch: Encodable {
        let path: String
        let name: String
        let line: Int
        let snippet: String
    }
    func searchOpenDocuments(query: String) {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else {
            web.evaluateJavaScript("window.showGlobalSearchResults([])")
            return
        }
        let urls = openDocuments
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            var matches: [SearchMatch] = []
            for url in urls {
                guard matches.count < 100 else { break }
                guard let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
                      let size = attrs[.size] as? NSNumber, size.int64Value <= 20_000_000,
                      let content = try? String(contentsOf: url, encoding: .utf8) else { continue }
                var fileMatches = 0
                var lineNum = 0
                content.enumerateLines { line, stop in
                    lineNum += 1
                    if let range = line.range(of: trimmed, options: .caseInsensitive) {
                        let startIdx = line.index(range.lowerBound, offsetBy: -40, limitedBy: line.startIndex) ?? line.startIndex
                        let endIdx = line.index(range.upperBound, offsetBy: 80, limitedBy: line.endIndex) ?? line.endIndex
                        let prefix = startIdx > line.startIndex ? "…" : ""
                        let suffix = endIdx < line.endIndex ? "…" : ""
                        let snippet = prefix + line[startIdx..<endIdx].trimmingCharacters(in: .whitespaces) + suffix
                        matches.append(SearchMatch(path: url.path, name: url.lastPathComponent, line: lineNum, snippet: snippet))
                        fileMatches += 1
                        if fileMatches >= 10 || matches.count >= 100 { stop = true }
                    }
                }
            }
            guard let data = try? JSONEncoder().encode(matches),
                  let json = String(data: data, encoding: .utf8) else { return }
            DispatchQueue.main.async {
                self?.web.evaluateJavaScript("window.showGlobalSearchResults(\(json))")
            }
        }
    }
    func userContentController(_ controller: WKUserContentController,didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, let body = message.body as? [String:Any], let action = body["action"] as? String else { return }
        switch action {
        case "open": openDialog()
        case "refresh": manualRefresh()
        case "openComparison": openComparison()
        case "openDualReading": openDualReading()
        case "closeComparison": comparisonVisible = false; comparisonSessions.deactivate()
        case "saveComparisonSession": saveComparisonSnapshot(body["session"])
        case "clearComparisonSession":
            let area = body["area"] as? String ?? comparisonArea
            guard ["reading","diff"].contains(area), !exporting else { return }
            comparisonSessions.clear(area)
            comparisonLeft = nil; comparisonRight = nil; activeReviewKey = nil
            web.evaluateJavaScript("window.resetComparisonSession()")
            sendComparisonFiles();compareFiles()
        case "clearComparison":
            if let side = body["side"] as? String, ["left","right"].contains(side) { clearComparison(side:side) }
        case "pickComparison": pickComparison(side: body["side"] as? String)
        case "compareFiles": compareFiles()
        case "swapComparison":
            swap(&comparisonLeft, &comparisonRight);sendComparisonFiles();compareFiles()
        case "saveReview":
            if let key = body["key"] as? String, key == activeReviewKey, let raw = body["notes"], let data = try? JSONSerialization.data(withJSONObject:raw), let notes = try? JSONDecoder().decode(ReviewNotes.self,from:data) {
                let saved = reviews.save(notes,for:key)
                web.evaluateJavaScript("window.reviewSaved(\(saved),\(jsString(key)))")
            }
        case "openEditor": openInEditor()
        case "selectEditor":
            if !exporting, let value = body["editor"] as? String {
                if value == "custom" { chooseEditorApp() }
                else { editor.select(value); sendLibrary() }
            }
        case "exportPDF": exportPDF()
        case "batchExport":
            if let paths = body["paths"] as? [String], let combined = body["combined"] as? Bool { beginBatchExport(paths: paths, combined: combined) }
        case "openDocument":
            if let path = body["path"] as? String, openDocuments.contains(where: { $0.path == path }) { load(URL(fileURLWithPath: path)) }
        case "searchOpenDocuments":
            if let query = body["query"] as? String { searchOpenDocuments(query: query) }
        case "closeDocument":
            if !exporting, let path = body["path"] as? String {
                openDocuments.removeAll { $0.path == path }
                if current?.standardizedFileURL.path == path {
                    if let next = openDocuments.first { load(next) }
                    else { current = nil; documentWatcher.stop(); lastContent = ""; window.title = "MD Preview"; window.representedURL = nil; web.evaluateJavaScript("window.showWelcome()"); sendLibrary() }
                } else { sendLibrary() }
            }
        case "ready":
            ready = true
            let version = Bundle.main.object(forInfoDictionaryKey:"CFBundleShortVersionString") as? String ?? "?"
            web.evaluateJavaScript("window.setAppInfo(\(jsString(version)),\(jsString(Bundle.main.bundlePath)))")
            sendLibrary()
            if !pending.isEmpty { comparisonSessions.deactivate(); let urls = pending; pending = []; openMany(urls) }
            else {
                // Finder may deliver an explicit open request just after launch. It takes priority.
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { [weak self] in
                    guard let self = self, self.current == nil, !self.comparisonVisible, self.library.state.resumeOnLaunch else { return }
                    if let area = self.comparisonSessions.activeArea, self.comparisonSessions.session(for:area) != nil { self.restoreWorkspace(area:area); return }
                    guard let path = self.library.state.lastPath else { return }
                    if FileManager.default.isReadableFile(atPath: path) { self.load(URL(fileURLWithPath: path)) }
                    else { self.showError("Letzte Datei nicht erreichbar · Datei verschoben oder SSD nicht verbunden.") }
                }
            }
        case "openRecent":
            if let path = body["path"] as? String, (library.state.history + library.state.bookmarks).contains(where: { $0.path == path }) { load(URL(fileURLWithPath: path)) }
        case "bookmark":
            if let path = current?.standardizedFileURL.path { library.toggleBookmark(path); sendLibrary() }
        case "removeBookmark":
            if let path = body["path"] as? String, library.state.bookmarks.contains(where: { $0.path == path }) { library.toggleBookmark(path); sendLibrary() }
        case "removeHistory":
            if let path = body["path"] as? String { library.removeHistory(path); sendLibrary() }
        case "clearHistory": library.clearHistory(); sendLibrary()
        case "resume":
            if let enabled = body["enabled"] as? Bool { library.setResume(enabled); sendLibrary() }
        case "position":
            if let path = body["path"] as? String, let raw = body["position"], let data = try? JSONSerialization.data(withJSONObject: raw), let position = try? JSONDecoder().decode(ReadingPosition.self, from: data) { library.savePosition(position, for: path) }
        default: break
        }
    }
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        if exporting { showError("Bitte den Export abschließen oder im Dialog abbrechen."); return .terminateCancel }
        guard ready else { return .terminateNow }
        web.evaluateJavaScript("({position:window.flushPosition(),review:window.flushReview(),session:window.flushComparisonSession()})") { [weak self] result, _ in
            // Save the returned snapshot directly, even if the bridge message arrives later.
            if let self = self, let snapshot = result as? [String:Any] {
                self.saveComparisonSnapshot(snapshot["session"])
                if let positionSnapshot = snapshot["position"] as? [String:Any], let path = positionSnapshot["path"] as? String, let raw = positionSnapshot["position"], let data = try? JSONSerialization.data(withJSONObject: raw), let position = try? JSONDecoder().decode(ReadingPosition.self, from: data) { self.library.savePosition(position, for: path) }
                if let review = snapshot["review"] as? [String:Any], let key = review["key"] as? String, key == self.activeReviewKey, let raw = review["notes"], let data = try? JSONSerialization.data(withJSONObject:raw), let notes = try? JSONDecoder().decode(ReviewNotes.self,from:data) { self.reviews.save(notes,for:key) }
            }
            sender.reply(toApplicationShouldTerminate: true)
        }
        return .terminateLater
    }
    func windowShouldClose(_ sender: NSWindow) -> Bool { NSApp.terminate(nil); return false }
    func webView(_ webView: WKWebView,decidePolicyFor action:WKNavigationAction,decisionHandler:@escaping(WKNavigationActionPolicy)->Void) {
        if action.navigationType == .linkActivated {
            if let url = action.request.url,["https","http","mailto"].contains(url.scheme ?? "") { NSWorkspace.shared.open(url) }
            decisionHandler(.cancel);return
        }
        decisionHandler(action.navigationType == .other ? .allow : .cancel)
    }
    func application(_ sender:NSApplication,openFiles filenames:[String]) { openMany(filenames.map { URL(fileURLWithPath: $0) });sender.reply(toOpenOrPrint:.success) }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender:NSApplication)->Bool { true }
}
@main
enum Application {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.setActivationPolicy(.regular);app.delegate = delegate;app.run()
    }
}

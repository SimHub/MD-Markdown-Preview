import WebKit
import UniformTypeIdentifiers

final class AssetHandler: NSObject, WKURLSchemeHandler {
    var directory: URL?
    var directories: [String: URL] = [:]
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let request = task.request.url, let root = (directories[request.host ?? ""] ?? ((request.host ?? "").hasPrefix("dual-") ? nil : directory))?.resolvingSymlinksInPath() else { task.didFailWithError(URLError(.fileDoesNotExist)); return }
        let file = root.appendingPathComponent(request.path).standardizedFileURL.resolvingSymlinksInPath()
        guard file.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: file) else { task.didFailWithError(URLError(.noPermissionsToReadFile)); return }
        let mime = UTType(filenameExtension: file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
        task.didReceive(URLResponse(url: request, mimeType: mime, expectedContentLength: data.count, textEncodingName: nil)); task.didReceive(data); task.didFinish()
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

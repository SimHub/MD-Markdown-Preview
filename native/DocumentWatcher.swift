import Foundation
import Dispatch
import Darwin

/// Observe both the file (in-place writes) and its directory (atomic replacement).
final class DocumentWatcher {
    private var directorySource: DispatchSourceFileSystemObject?
    private var fileSource: DispatchSourceFileSystemObject?
    private var directoryPath: String?
    private var filePath: String?
    private var work: DispatchWorkItem?
    private var changed: (() -> Void)?

    func watch(_ document: URL, changed: @escaping () -> Void) {
        let parent = document.deletingLastPathComponent().path
        if directoryPath != parent { stop() }
        self.changed = changed
        directoryPath = parent
        if directorySource == nil {
            directorySource = makeSource(parent)
            directorySource?.setEventHandler { [weak self] in self?.directoryChanged() }
            directorySource?.resume()
        }
        if filePath != document.path { fileSource?.cancel(); fileSource = nil }
        filePath = document.path
        if fileSource == nil {
            fileSource = makeSource(document.path)
            fileSource?.setEventHandler { [weak self] in self?.fileChanged() }
            fileSource?.resume()
        }
    }
    private func makeSource(_ path: String) -> DispatchSourceFileSystemObject? {
        let descriptor = Darwin.open(path, O_EVTONLY)
        guard descriptor >= 0 else { return nil } // The periodic check remains a fallback.
        let source = DispatchSource.makeFileSystemObjectSource(fileDescriptor: descriptor, eventMask: [.write,.rename,.delete,.attrib,.extend,.link,.revoke], queue: .main)
        source.setCancelHandler { Darwin.close(descriptor) }
        return source
    }
    private func directoryChanged() {
        let invalidated = !(directorySource?.data.intersection([.rename,.delete,.revoke]) ?? []).isEmpty
        if invalidated { directorySource?.cancel(); directorySource = nil }
        // The saved file may now be a new inode. Reattach when the callback refreshes it.
        fileSource?.cancel(); fileSource = nil
        schedule()
    }
    private func fileChanged() {
        if !(fileSource?.data.intersection([.rename,.delete,.revoke]) ?? []).isEmpty {
            fileSource?.cancel(); fileSource = nil
        }
        schedule()
    }
    private func schedule() {
        work?.cancel()
        let work = DispatchWorkItem { [weak self] in self?.changed?() }
        self.work = work
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.12, execute: work)
    }
    func stop() {
        work?.cancel(); work = nil
        fileSource?.cancel(); fileSource = nil
        directorySource?.cancel(); directorySource = nil
        filePath = nil; directoryPath = nil; changed = nil
    }
    deinit { fileSource?.cancel(); directorySource?.cancel(); work?.cancel() }
}

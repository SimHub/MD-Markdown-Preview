import Cocoa

// Use the system's paginated print engine rather than a single, very tall PDF page.
enum PDFPrintSettings {
    static func make(destination: URL) -> NSPrintInfo {
        let info = NSPrintInfo()
        info.paperSize = NSSize(width: 595.28, height: 841.89)
        info.topMargin = 42; info.bottomMargin = 42
        info.leftMargin = 42; info.rightMargin = 42
        info.isHorizontallyCentered = false
        info.isVerticallyCentered = false
        info.horizontalPagination = .fit
        info.verticalPagination = .automatic
        info.scalingFactor = 1
        info.jobDisposition = .save
        info.dictionary()[NSPrintInfo.AttributeKey.jobSavingURL] = destination
        return info
    }
}

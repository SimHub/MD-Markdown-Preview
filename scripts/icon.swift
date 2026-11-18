import AppKit

// Draw the same typographic m↓ mark used in the app, at every macOS icon size.
let output = CommandLine.arguments[1]
try FileManager.default.createDirectory(atPath: output, withIntermediateDirectories: true)
for (name, pixels) in [("icon_16x16",16),("icon_16x16@2x",32),("icon_32x32",32),("icon_32x32@2x",64),("icon_128x128",128),("icon_128x128@2x",256),("icon_256x256",256),("icon_256x256@2x",512),("icon_512x512",512),("icon_512x512@2x",1024)] {
    let size = CGFloat(pixels)
    let bitmap = NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:pixels,pixelsHigh:pixels,bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep:bitmap)
    let context = NSGraphicsContext.current!.cgContext
    context.scaleBy(x:size/1024,y:size/1024)
    let rect = NSRect(x:80,y:80,width:864,height:864)
    let tile = NSBezierPath(roundedRect:rect,xRadius:192,yRadius:192)
    let shadow = NSShadow();shadow.shadowColor = NSColor.black.withAlphaComponent(0.16);shadow.shadowBlurRadius = 28;shadow.shadowOffset = NSSize(width:0,height:-12)
    NSGraphicsContext.saveGraphicsState();shadow.set()
    NSColor(calibratedRed:0.97,green:0.98,blue:0.98,alpha:1).setFill();tile.fill()
    NSGraphicsContext.restoreGraphicsState()
    NSGradient(starting:NSColor.white,ending:NSColor(calibratedRed:0.90,green:0.94,blue:0.93,alpha:1))!.draw(in:tile,angle:-90)
    NSColor(calibratedRed:0.15,green:0.17,blue:0.20,alpha:1).setFill()
    let font = NSFont.systemFont(ofSize:540,weight:.heavy)
    ("m" as NSString).draw(at:NSPoint(x:190,y:245),withAttributes:[.font:font,.foregroundColor:NSColor(calibratedRed:0.15,green:0.17,blue:0.20,alpha:1),.kern:-25])
    // A geometric arrow stays crisp at small Finder and Dock sizes.
    let arrow = NSBezierPath();arrow.move(to:NSPoint(x:752,y:641));arrow.line(to:NSPoint(x:752,y:370));arrow.move(to:NSPoint(x:678,y:444));arrow.line(to:NSPoint(x:752,y:370));arrow.line(to:NSPoint(x:826,y:444));arrow.lineWidth = 43;arrow.lineCapStyle = .round;arrow.lineJoinStyle = .round
    NSColor(calibratedRed:0.16,green:0.52,blue:0.46,alpha:1).setStroke();arrow.stroke()
    NSGraphicsContext.restoreGraphicsState()
    try bitmap.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:output).appendingPathComponent(name+".png"))
}

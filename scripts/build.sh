#!/bin/zsh
set -eu
cd "${0:A:h:h}"
export CLANG_MODULE_CACHE_PATH="$PWD/.build-cache/clang"
export SWIFT_MODULECACHE_PATH="$PWD/.build-cache/swift"
APP="$PWD/dist/MD Preview.app"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/web" "$CLANG_MODULE_CACHE_PATH" "$SWIFT_MODULECACHE_PATH"
./node_modules/.bin/esbuild web/app.js --bundle --minify --outfile="$APP/Contents/Resources/web/app.js"
cp web/index.html web/app.css "$APP/Contents/Resources/web/"
python3 scripts/stamp-resources.py "$APP/Contents/Resources/web" native/Info.plist
swiftc native/App.swift native/LibraryStore.swift native/PDFPrintSettings.swift native/AssetHandler.swift native/BatchPDFExporter.swift native/DocumentWatcher.swift native/EditorIntegration.swift native/ReviewStore.swift native/ComparisonSelection.swift native/ComparisonSessionsStore.swift -O -module-cache-path "$SWIFT_MODULECACHE_PATH" -framework Cocoa -framework WebKit -framework PDFKit -o "$APP/Contents/MacOS/MDPreview"
cp native/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
cp native/Info.plist "$APP/Contents/Info.plist"
codesign --force --sign - "$APP"
printf '\nApp erstellt: %s\n' "$APP"

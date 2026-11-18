#!/bin/zsh
set -eu
cd "${0:A:h:h}"
mkdir -p .build-cache/swift
swiftc native/LibraryStore.swift scripts/LibraryStoreTests.swift -module-cache-path "$PWD/.build-cache/swift" -o .build-cache/test-library
.build-cache/test-library
swiftc native/EditorIntegration.swift native/DocumentWatcher.swift scripts/EditorWatcherTests.swift -module-cache-path "$PWD/.build-cache/swift" -framework Cocoa -o .build-cache/test-editor-watcher
.build-cache/test-editor-watcher
swiftc native/ReviewStore.swift scripts/ReviewStoreTests.swift -module-cache-path "$PWD/.build-cache/swift" -o .build-cache/test-review
.build-cache/test-review
swiftc native/ComparisonSelection.swift scripts/ComparisonSelectionTests.swift -module-cache-path "$PWD/.build-cache/swift" -o .build-cache/test-comparison-selection
.build-cache/test-comparison-selection
swiftc native/ComparisonSessionsStore.swift scripts/ComparisonSessionsTests.swift -module-cache-path "$PWD/.build-cache/swift" -o .build-cache/test-comparison-sessions
.build-cache/test-comparison-sessions

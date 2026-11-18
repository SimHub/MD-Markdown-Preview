# MD Preview

**English** · [Deutsch](README.de.md)

A fast, native macOS Markdown & plain-text reader built with Swift/AppKit and the system `WKWebView` — **zero Electron, zero bundled browser engine, zero telemetry**.

Visually inspired by calm, distraction-free reading, **MD Preview** goes beyond a simple viewer with **side-by-side manuscript comparison**, **local diff & code-review notes**, and **batch A4 PDF export**.

## Highlights

- **Calm Reading & Live Reload**: Switch between *Read*, *Split*, and *Source* views (`⌘O` to open multiple files, drag & drop, or `./mdpreview file.md`). Watches files on disk (including atomic saves) and reloads automatically; `⌘R` forces a cache-busting reload for text and relative images.
- **Two-Document Reading & Manuscript Diff (`⇧⌘2`)**: Read two full documents side by side or stacked with independent scrolling. Built-in word, character, sentence, and paragraph comparison highlights **Equal**, **Similar**, **Different**, and **Only here** blocks with clickable jump badges — anchored to handle large manuscripts (up to 40,000 blocks / 4M chars) against individual chapters.
- **Local Diff & Review Notes (`⇧⌘D`)**: Unified or side-by-side UTF-8 diff with per-hunk checkmarks and review comments stored locally for exact file versions (last 20 reviews kept).
- **A4 PDF & Batch Export (`⇧⌘E`)**: Export the active document as a clean, light-themed A4 PDF with selectable text, or select and reorder multiple open files into separate PDFs or one merged PDF.
- **Editor Integration (`⌘E`)**: Jump straight into VS Code, Neovim/LazyVim, or any custom editor app. Copyable editor shortcuts are included in [integrations/README.md](integrations/README.md).
- **Bilingual UI (DE / EN)**: Toggle between German and English directly in the toolbar.
- **Privacy First**: 100% local and read-only. Markdown is sanitized with `DOMPurify`, relative images are scoped to each document's folder, and no accounts, cloud sync, or analytics exist.

## Quick Start

### Build from Source

Requirements: **macOS 12+**, **Apple Command Line Tools** (`xcode-select --install`), **Node.js** (with `npm`), and **Python 3**. The compiled `.app` bundle has no runtime dependencies.

```sh
npm ci
npm run build
npm test
```

Build output: `dist/MD Preview.app` (ad-hoc code-signed for local use; not notarized with a paid Apple Developer ID).

### Launch

- Double-click `dist/MD Preview.app` in Finder (or use `Aktuelle MD Preview starten.command` to force a fresh instance).
- Or launch from the terminal:

```sh
./mdpreview
./mdpreview /path/to/README.md
./mdpreview "/path/Chapter 1.md" "/path/Chapter 2.md"
```

## Architecture

| Component | Purpose |
| --- | --- |
| `native/` (`Swift` / `AppKit`) | Native window, menus, file dialogs, drag & drop, `WKWebView` bridge, file watcher, `PDFKit` batch export |
| `web/` (`HTML` / `CSS` / `JS`) | Reader UI, `markdown-it` + `DOMPurify` + `highlight.js`, `diff` + manuscript comparison, DE/EN i18n |
| `scripts/` | Build script (`esbuild` + `swiftc`), resource hashing, JS & native test suites |

## Deliberate Scope

MD Preview is intentionally a **read-only** viewer and comparison tool. It does not include a WYSIWYG editor, file saving, Word export, or a Finder Quick Look extension.

## License

ISC — see [package.json](package.json).

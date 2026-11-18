# MD Preview

**English** · [Deutsch](README.de.md)

![macOS 12+](https://img.shields.io/badge/macOS-12%2B-000000?logo=apple)
![Swift + AppKit](https://img.shields.io/badge/Native-Swift%20%2F%20AppKit-F05138?logo=swift&logoColor=white)
![Zero Electron](https://img.shields.io/badge/Electron-0%20MB-298575)
![License: ISC](https://img.shields.io/badge/License-ISC-blue)

A fast, native macOS Markdown & plain-text reader built with **Swift/AppKit** and the system `WKWebView` — **zero Electron, zero bundled browser engine, zero telemetry**.

Visually inspired by calm, distraction-free reading, **MD Preview** goes far beyond a single-file viewer: compare full manuscripts side by side, review local diffs with notes, search across all loaded documents, and export ordered multi-file A4 PDFs.

---

## Why MD Preview?

- **Truly Native & Instant**: Built on AppKit + macOS `WKWebView`. Launches in milliseconds and stays light on memory.
- **Calm Reading + Modern Markdown**: *Read*, *Split*, and *Source* views, table of contents, light/dark themes, focus mode, syntax highlighting (`highlight.js`), **GFM Alerts** (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, etc.), and **Task Lists** (`- [x]`).
- **Two-Document Reading & Manuscript Diff (`⇧⌘2`)**: Read two full documents side by side or stacked with independent scrolling. Built-in word, character, sentence, and paragraph comparison highlights **Equal**, **Similar**, **Different**, and **Only here** blocks with clickable jump badges — anchored to handle large manuscripts (up to 40,000 text blocks / 4M chars) against single chapters.
- **Local Diff & Review Notes (`⇧⌘D`)**: Unified or side-by-side UTF-8 diff with per-hunk checkmarks and review comments stored locally for exact file versions (last 20 reviews kept).
- **Search Document & All Loaded Files (`⌘F` / `⇧⌘F`)**: Fast in-document search (`⌘F`) plus instant search across filenames (Open, Bookmarks, History) and contents of all currently loaded files (`⇧⌘F`).
- **A4 PDF & Batch Export (`⇧⌘E`)**: Export the active file as a clean light-mode A4 PDF, or pick and reorder multiple open files into separate PDFs or one merged PDF.
- **Bilingual UI (DE / EN)**: Switch between German and English anytime right from the toolbar.
- **100% Private & Local**: Read-only, sanitized with `DOMPurify`, relative images scoped to each document's folder, zero accounts, zero analytics.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘O` | Open one or multiple Markdown / TXT files |
| `⌘F` | Find in current document |
| `⇧⌘F` | Search filenames & all loaded files |
| `⇧⌘2` | Two-document reading & text comparison |
| `⇧⌘D` | Local file diff & code review |
| `⇧⌘E` | Export as A4 PDF |
| `⌘E` | Open current file in preferred editor |
| `⌘R` | Force reload file & clear image cache |
| `Esc` | Exit focus mode / return from comparison |

---

## Download or Build from Source

### Option A: Download Prebuilt App (GitHub Releases)

If a release archive (`MD-Preview-macOS.zip`) is published under **Releases**, download and unzip it, then move `MD Preview.app` to `/Applications`.

> [!NOTE]
> **macOS Gatekeeper:** Because this is a free open-source project without a paid Apple Developer ID, the app is ad-hoc signed rather than notarized. On first launch, right-click `MD Preview.app` → **Open** (or run `xattr -cr "/Applications/MD Preview.app"`).

### Option B: Build from Source

Requirements: **macOS 12+**, **Apple Command Line Tools** (`xcode-select --install`), **Node.js** (`npm`), and **Python 3**. The compiled `.app` bundle has no runtime dependencies.

```sh
git clone https://github.com/SimHub/MD-Markdown-Preview.git
cd MD-Markdown-Preview
npm ci
npm run build
npm test
```

Launch `dist/MD Preview.app` in Finder or from the terminal:

```sh
./mdpreview
./mdpreview /path/to/README.md
./mdpreview "/path/Chapter 1.md" "/path/Chapter 2.md"
```

---

## Editor Integration

Jump straight into **VS Code**, **Neovim / LazyVim**, or any custom editor with `⌘E`. Copyable editor shortcuts are included in [integrations/README.md](integrations/README.md).

## Architecture

| Component | Purpose |
| --- | --- |
| `native/` (`Swift` / `AppKit`) | Native window, menus, file dialogs, drag & drop, `WKWebView` bridge, file watcher, `PDFKit` batch export |
| `web/` (`HTML` / `CSS` / `JS`) | Reader UI, `markdown-it` + `DOMPurify` + `highlight.js`, `diff` + manuscript comparison, DE/EN i18n |
| `scripts/` | Build script (`esbuild` + `swiftc`), resource hashing, JS & native test suites |

## License

ISC — see [package.json](package.json).

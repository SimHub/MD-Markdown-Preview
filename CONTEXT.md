# Projektkontext · MD Preview

Stand 7. November 2026. Die macOS-App trägt Version **1.9.1**, Build **18** und die Bundle-ID `de.local.mdpreview`. Maßgeblich ist [native/Info.plist](native/Info.plist).

MD Preview ist eine kompakte macOS-App zum lokalen Lesen von Markdown und UTF-8-Text. Sie entstand als Vorschau für die Arbeit im Editor und unterstützt inzwischen auch den Vergleich längerer Manuskripte, manuelle Reviews und PDF-Export. Das Projekt und das fertige App-Bundle liegen auf der externen SSD. Die Bedienung beschreibt die [README](README.md).

## Architektur

| Datei | Zuständigkeit |
| --- | --- |
| [native/App.swift](native/App.swift) | Einstiegspunkt, AppKit-Fenster, Menüs, Dateiauswahl, Drag-and-drop und Kommunikation mit dem Frontend |
| [web/index.html](web/index.html), [web/app.css](web/app.css), [web/app.js](web/app.js) | Oberfläche, Markdown-Rendering, Einzelansicht, Lesestellen und Exportdialoge |
| [web/comparison.js](web/comparison.js), [native/ComparisonSelection.swift](native/ComparisonSelection.swift) | Ansichten „Zwei Dateien“ und „Diff“, Auswahl der beiden Dateien, Review und Sitzungswechsel |
| [web/text-comparison.js](web/text-comparison.js) | Zuordnung von Textblöcken und Hervorhebung von Wort-, Zeichen-, Satz- und Absatzunterschieden |
| [native/AssetHandler.swift](native/AssetHandler.swift) | Relative Bilder über das lokale Schema `mdasset://` |
| [native/DocumentWatcher.swift](native/DocumentWatcher.swift), [native/EditorIntegration.swift](native/EditorIntegration.swift) | Dateiüberwachung und Öffnen in einem externen Editor |
| [native/PDFPrintSettings.swift](native/PDFPrintSettings.swift), [native/BatchPDFExporter.swift](native/BatchPDFExporter.swift) | A4-Druckeinstellungen, Mehrdatei-Export und Zusammenführen mit PDFKit |

Swift und AppKit stellen das native Fenster bereit. Die Oberfläche läuft als gebündeltes HTML, CSS und JavaScript in `WKWebView`. JavaScript meldet Aktionen über `window.webkit.messageHandlers.native`. Swift liest die gewählten Dateien und übergibt die Ergebnisse an Funktionen auf `window`. Bei Änderungen an einer Aktion sind beide Seiten dieser Schnittstelle relevant.

Markdown wird mit `markdown-it` gerendert und mit DOMPurify bereinigt. Highlight.js färbt Codeblöcke ein. Das Paket `diff` liefert Zeilen-Diffs und feine Textunterschiede. Relative Bildpfade werden auf den jeweiligen Dokumentordner begrenzt. Im Zwei-Dateien-Modus haben die beiden Seiten getrennte Bildwurzeln, damit gleichnamige Bilder aus verschiedenen Ordnern korrekt angezeigt werden.

## Arbeitsabläufe und Zustände

- Die Hauptansicht bietet Vorschau, Quelltext, geteilte Ansicht und Inhaltsverzeichnis. Dateien werden schreibgeschützt gelesen. Änderungen im Editor werden nach dem Speichern erkannt, auch bei atomarem Dateiersatz. Ein sekündlicher Abgleich dient als Rückfall.
- „Zwei Dateien“ zeigt vollständige Dokumente mit unabhängigen Scrollbereichen. Im Textvergleich bilden unveränderte Absätze Anker für ähnliche Absätze dazwischen. Nummerierte Markierungen führen zur zugeordneten Stelle im jeweils anderen Dokumentbereich. Die Zuordnung beruht auf dem Wortlaut.
- „Diff“ zeigt Änderungen am Quelltext mit Zeilennummern und Review-Notizen pro Änderungsblock. In beiden Bereichen lassen sich Dateien gemeinsam oder nacheinander öffnen. „← Zur Hauptansicht“ und Esc speichern die aktuelle Sitzung und wechseln zurück.
- Der PDF-Export nutzt WebKits Druckfunktion mit A4-Layout und auswählbarem Text. Der Mehrdatei-Export liest die Dateien in der gewählten Reihenfolge. In einer gemeinsamen PDF beginnt jede Datei auf einer neuen Seite. Einzelne PDFs erhalten bei Namenskonflikten einen Zahlenzusatz.

Die App speichert ihren Zustand lokal in macOS UserDefaults.

| Schlüssel | Inhalt |
| --- | --- |
| `ReadingLibrary.v1` | [LibraryStore](native/LibraryStore.swift) verwaltet Verlauf, Lesezeichen, Lesestellen und „Beim Start fortsetzen“. |
| `LastComparisonSessions.v1` | [ComparisonSessionsStore](native/ComparisonSessionsStore.swift) hält je eine letzte Sitzung für „Zwei Dateien“ und „Diff“. Gespeichert werden Dateipfade, Ansicht, Vergleichsstufe, Scrollpositionen und Navigation im Vergleich. |
| `FileReviews.v1` | [ReviewStore](native/ReviewStore.swift) hält bis zu 20 Reviews. Der Schlüssel wird aus beiden Dateipfaden und Dateiinhalten berechnet, damit Notizen zur richtigen Fassung gehören. |

„Letzte Sitzung löschen“ entfernt den Zustand des aktuellen Bereichs und leert seine Dateiplätze. „Review löschen“ entfernt die Notizen des aktuellen Vergleichs. Beim Fortsetzen werden die Originaldateien vom Datenträger neu gelesen. Explizit über Finder oder Terminal geöffnete Dateien haben beim Start Vorrang.

## Relevante Grenzen und Regressionen

- Die Hauptansicht liest UTF-8-Dateien unter 20 MB. Für zwei Dateien gelten maximal 2 MB und 20.000 Zeilen pro Datei.
- Der Textvergleich verarbeitet insgesamt bis zu 40.000 Textblöcke und 4 Millionen Zeichen. Aufwendige Einzelstellen werden absatzweise markiert. Der Vergleich eines langen Gesamtmanuskripts mit einer kurzen Kapitelfassung ist ein getesteter Anwendungsfall. Eine frühere Grenze von 3.000 Blöcken und 800.000 Zeichen verhinderte dabei jede Markierung.
- Vergleichsdateien können verschoben oder auf einer nicht angeschlossenen SSD liegen. Ein fehlgeschlagenes Laden soll die gespeicherte Sitzung nicht mit leeren Scrollpositionen überschreiben.
- Beim Wechsel zwischen „Zwei Dateien“, „Diff“ und Hauptansicht werden Sitzungszustand und offene Review-Notizen vor dem Wechsel erfasst. Die Scrollbereiche der beiden Dokumente bleiben unabhängig.

## Bauen, starten und prüfen

Zum Bauen werden macOS, Apple Command Line Tools, Node.js mit npm und Python 3 benötigt. Die App deklariert macOS 12 als Mindestversion.

```sh
npm ci --cache .build-cache/npm
npm run build
npm test
```

[scripts/build.sh](scripts/build.sh) bündelt JavaScript mit esbuild, kompiliert Swift und signiert `dist/MD Preview.app` lokal ad hoc. [scripts/stamp-resources.py](scripts/stamp-resources.py) versieht JS- und CSS-Dateinamen mit einem Inhalts-Hash. Änderungen gehören in `web/` oder `native/`. Nach einem Build zeigt die Fußzeile die laufende App-Version.

```sh
./mdpreview
./mdpreview "/absoluter/pfad/zur/Datei.md"
```

Der [aktuelle Starter](Aktuelle%20MD%20Preview%20starten.command) öffnet gezielt das App-Bundle aus diesem Projekt in einer neuen Instanz. Nach einem Update die alte Instanz mit ⌘Q beenden. Die [Editor-Anbindung](integrations/README.md) enthält kopierbare Vorlagen für VS Code und Neovim/LazyVim.

`npm test` prüft das gebaute Frontend mit jsdom und die Swift-Komponenten mit eigenständigen Testprogrammen. Nach Änderungen am Frontend zuerst bauen, damit die Tests das aktuelle Bundle verwenden. Für zusätzliche WebKit-Prüfungen gibt es [ComparisonSmokeTest.swift](scripts/ComparisonSmokeTest.swift) und [PDFSmokeTest.swift](scripts/PDFSmokeTest.swift). Ihre Ausgaben liegen unter `tmp/comparison/` und `tmp/pdfs/`. `dist/`, `.build-cache/`, `node_modules/` und diese Testausgaben sind generiert.

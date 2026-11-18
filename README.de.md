# MD Preview

[English](README.md) · **Deutsch**

Ein kleiner lokaler Markdown-Reader für macOS, visuell von der ruhigen Dokumentansicht von Markdific inspiriert. Native Swift/AppKit-Hülle mit dem vorhandenen macOS-WebKit; keine mitgelieferte Browser-Engine und kein Server.

## Starten

Im Finder `dist/MD Preview.app` doppelklicken. Unten im Fenster wird die laufende Versionsnummer angezeigt; beim Darüberfahren erscheint der App-Pfad. Falls eine ältere Kopie startet, `Aktuelle MD Preview starten.command` im Projektordner doppelklicken: Dieser Starter öffnet gezielt diese App in einer neuen Instanz. Nach lokalen Updates werden Frontend-Ressourcen mit neuen Cache-Kennungen geladen und der WebKit-Darstellungscache beim App-Start geleert. Die App kann direkt auf einem lokalen oder externen Laufwerk bleiben. Optional ein Alias ins Dock ziehen.

Aus dem Projektordner im Terminal:

```sh
./mdpreview
./mdpreview /pfad/zur/README.md
./mdpreview "/pfad/Kapitel 1.md" "/pfad/Kapitel 2.md"
```

Mehrere Dateien gleichzeitig öffnen: **⌘O** mit Mehrfachauswahl, Drag-and-drop mehrerer Dateien oder Finder → Öffnen mit → MD Preview. Die App wird als optionaler Markdown-Viewer registriert, ohne die bisherige Standard-App zu ändern.

## Funktionen

- Mehrere geöffnete Dateien in der Seitenleiste; anklicken zum Wechseln, × zum Schließen. Die Dateiliste gilt für die aktuelle Sitzung.
- **Mehrere als PDF …** in der Seitenleiste: Dateien per Häkchen auswählen und mit ↑ / ↓ sortieren.
- **Einzelne PDFs …**: Zielordner wählen. Jede ausgewählte Datei erhält eine PDF; vorhandene Dateien werden nicht überschrieben. Gleiche Namen bekommen Zusätze wie `(2)`.
- **Eine gemeinsame PDF …**: Speicherort wählen. Die ausgewählten Dateien erscheinen in der gewählten Reihenfolge, jede beginnt auf einer neuen Seite. Relative Bilder werden aus dem jeweiligen Dokumentordner geladen.
- Der Mehrdatei-Export liest die aktuelle Fassung jeder ausgewählten Datei vom Datenträger. Die geöffnete Leseansicht bleibt erhalten. Bei einem Fehler wird keine neue gemeinsame PDF gespeichert; bereits erzeugte einzelne PDFs bleiben erhalten.
- **▥ Zwei Dateien / ⇧⌘2**: zwei vollständige Dateien gleichzeitig lesen. Unter „Ansicht“ zwischen Dokumenten nebeneinander und untereinander umschalten; beide Bereiche scrollen unabhängig. Markdown wird formatiert, TXT und Code erscheinen als Klartext. Bilder werden dem jeweiligen Dokumentordner zugeordnet. Dieselbe Dateiauswahl kann auch im Diff angezeigt werden.
- Der **Textvergleich** ist beim Start standardmäßig auf **Wörter** gestellt. Textblöcke werden sichtbar als **Gleich**, **Ähnlich**, **Unterschiedlich** oder **Nur hier** beschriftet; dieselben Nummern bezeichnen zugeordnete Stellen. Ein Klick auf eine Markierung scrollt ausschließlich die andere Datei zur Gegenstelle und hebt beide Stellen kurz hervor. Das funktioniert in beiden Richtungen, nebeneinander und untereinander; fokussierte Badges lassen sich mit Enter oder Leertaste auslösen. „Nur hier“ zeigt stattdessen den Hinweis auf die fehlende Gegenstelle. „Ähnlich“ meint gemeinsame Wörter, keine inhaltliche oder semantische Bewertung.
- Unter **Zwei Dateien → Textvergleich** können Unterschiede im sichtbaren Text nach **Wörtern, Zeichen, Sätzen oder Absätzen** hervorgehoben werden. Ähnliche Textblöcke werden zugeordnet; hinzugefügte bzw. entfernte Stellen sind grün/rechts und rot/links markiert. Mit ↑ / ↓ zwischen Fundstellen springen. Die Darstellung und Originaldateien bleiben erhalten; „Aus“ entfernt die Markierungen. Reine Formatierung wie Fett/Kursiv zählt nicht als Textunterschied. Umfangsgrenze: insgesamt 40.000 Textblöcke und 4 Millionen Zeichen (zusätzlich gelten die Dateigrenzen des Vergleichs). Große Manuskripte werden über unveränderte Absätze verankert, damit auch ein Gesamtentwurf mit einem einzelnen Kapitel verglichen werden kann. Aufwendige Textblöcke werden absatzweise markiert, statt den gesamten Vergleich abzubrechen. „Vergleichen“ startet die Markierung ausdrücklich; eine Meldung über dem Text zeigt Erfolg oder den Fehlergrund.
- **← Zur Hauptansicht** oben links führt aus „Zwei Dateien“ und „Diff“ zurück zur normalen Dokumentansicht. Alternativ **Esc** drücken. Die letzte Sitzung wird dabei gespeichert.
- **Letzte Sitzung**: „Zwei Dateien“ und „Diff“ merken sich jeweils ein letztes Dateipaar mit Ansicht, Textvergleich-Einstellung und Scrollpositionen. Beim Wiederöffnen des Bereichs wird dieser Zustand geladen. War der Bereich beim Beenden offen, setzt die App ihn beim nächsten normalen Start fort, sofern „Beim Start fortsetzen“ aktiviert ist. Gezielt per Finder/Terminal geöffnete Dateien haben Vorrang.
- **Letzte Sitzung löschen** entfernt den gespeicherten Zustand des aktuellen Bereichs und leert dessen beide Dateiplätze. Originaldateien und separat gespeicherte Review-Notizen bleiben erhalten. Gespeichert werden nur Dateipfade und Einstellungen, keine Dokumentkopien; fehlende Dateien werden als nicht erreichbar angezeigt und können ersetzt werden.
- **⇄ Diff / ⇧⌘D**: zwei UTF-8-Text- oder Codedateien vergleichen, untereinander oder nebeneinander. In beiden Ansichten können Dateien gemeinsam oder einzeln nacheinander ausgewählt bzw. hineingezogen werden. Eine einzelne Datei füllt zuerst den leeren ersten Bereich, danach den zweiten; sind beide belegt, ersetzt ein ungezielter Drop die zweite Datei. Ein Drop auf einen Dateinamen oder einen Dokumentbereich ersetzt gezielt nur diese Seite. Über × neben dem Dateinamen lässt sich eine Seite leeren. Im Diff untereinander kann die Zielseite über die Dateinamen gewählt werden. Vorher/Nachher lassen sich tauschen; „Neu vergleichen“ liest beide Dateien erneut ein.
- Manuelles Code-Review: Kommentare pro Änderungsblock und „Geprüft“-Markierungen. Notizen werden lokal für exakt diese Dateipfade und Inhalte gespeichert. Nach einer Änderung startet ein eigener Review; die letzten 20 Reviews bleiben abrufbar, wenn dieselben Fassungen erneut verglichen werden. „Review löschen“ entfernt die Notizen des aktuellen Vergleichs.
- Der Vergleich ist schreibgeschützt und führt keinen Code aus. Maximal 2 MB und 20.000 Zeilen pro Datei; sehr große Änderungen werden mit einer Meldung begrenzt.
- Lese-, Quelltext- und geteilte Ansicht; Quelltext ist schreibgeschützt.
- TXT-Dateien werden als reiner Text mit unveränderten Sonderzeichen und Einrückungen dargestellt.
- **PDF ↗**, **Datei → Als PDF exportieren …** oder **⇧⌘E**: Speicherort wählen, dann als mehrseitige A4-PDF exportieren. Helles Drucklayout, auswählbarer Text, Tabellen, Code und Bilder; unabhängig von der aktuellen Ansicht und dem Farbschema.
- Der Export enthält die gerade angezeigte Dokumentfassung. Fehlende Bilder werden nach maximal drei Sekunden Wartezeit ausgelassen.
- Anklickbares Inhaltsverzeichnis, Schriftgröße, Hell-/Dunkelmodus, Sprachumschaltung (DE/EN).
- Verlauf der letzten 15 Dateien, einzelne Einträge entfernen oder Verlauf löschen.
- Dauerhafte Datei-Lesezeichen über den Stern in der Werkzeugleiste.
- Lesestellen und Ansicht pro Datei: Wiederherstellung anhand der Überschrift und des Abstands dazu, mit relativer Scrollposition als Rückfall.
- Standardmäßig beim Start das letzte Dokument fortsetzen; unter ⚙ abschaltbar. Explizit per Finder oder Terminal geöffnete Dateien haben Vorrang.
- „Verlauf löschen“ entfernt auch Lesestellen unmarkierter Dateien und die automatische Startdatei; Lesezeichen und deren Lesestellen bleiben erhalten. Dateien werden nie gelöscht.
- Fokusmodus; mit Escape zurück.
- Tabellen, Code mit Syntaxfarben, Listen, Zitate und Bilder.
- **↻ / ⌘R** liest die Datei auch bei unverändertem Text neu und leert den WebKit-Bildcache. Relative Bilder bekommen zusätzlich eine neue Ladeadresse; Lesestelle und Ansicht bleiben erhalten.
- **↗ Editor / ⌘E** öffnet die aktuelle Datei im bevorzugten Editor. Unter ⚙ stehen VS Code, Neovim/LazyVim und eine frei wählbare Editor-App zur Auswahl.
- Dateiüberwachung reagiert kurz nach dem Speichern, auch bei atomarem Dateiersatz. Der sekündliche Abgleich bleibt als Rückfall erhalten.
- VS-Code- und Neovim-Shortcuts als kopierbare Vorlagen: siehe [Editor-Anbindung](integrations/README.md).
- Beim Zurückwechseln zur App wird sofort auf Dateiänderungen geprüft.
- UTF-8-Dateien bis 20 MB; externe Änderungen werden einmal pro Sekunde geprüft.
- Relative Bilder innerhalb des Dokumentordners werden unterstützt. Bilder außerhalb dieses Ordners werden nicht geladen.
- Keine Konten, Telemetrie oder Cloud. Externe Bilder werden von ihrer jeweiligen URL geladen; externe Links öffnen im Standardbrowser.

Bewusst nicht enthalten: visueller Editor, Speichern, Mermaid, LaTeX, Word-Export, Finder-Quick-Look-Erweiterung und Bearbeitung mehrerer Dateien.

## Bauen & Testen

Voraussetzungen: macOS 12+, Apple Command Line Tools (`swiftc`), Node.js (mit `npm`) und Python 3. Die gebaute App benötigt zur Laufzeit weder Node.js noch die Command Line Tools.

```sh
npm ci
npm run build
npm test
```

Projektabhängigkeiten, npm-Cache und Swift-/Clang-Modulcaches können lokal über `.build-cache` gehalten werden (`npm ci --cache .build-cache/npm`). Verlauf, Lesezeichen und Lesestellen werden lokal über macOS `UserDefaults` gespeichert (nur Dateipfade und Einstellungen, keine Dokumentinhalte).

Build-Ausgabe: `dist/MD Preview.app`. Die App wird lokal ad hoc signiert, nicht mit einem Apple-Entwicklerzertifikat notarisiert.

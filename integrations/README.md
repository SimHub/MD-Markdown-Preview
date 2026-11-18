# Editor-Anbindung

In MD Preview unter **⚙ → Bevorzugter Editor** VS Code, Neovim/LazyVim oder eine andere installierte Editor-App auswählen. **↗ Editor** oder **⌘E** öffnet die aktuelle Datei dort. Es werden keine Editor-Einstellungen automatisch verändert.

Die Vorschau aktualisiert sich nach dem Speichern. Ungespeicherte Änderungen werden nicht übertragen. Die Dateiüberwachung reagiert auch auf das Ersetzen einer Datei beim Speichern; ein regelmäßiger Abgleich bleibt als Rückfall erhalten.

## Visual Studio Code → MD Preview

1. Den Task aus `vscode/tasks.json` in die `.vscode/tasks.json` deines jeweiligen Projekts übernehmen. Bei vorhandenen Tasks nur den zusätzlichen Eintrag in `tasks` einfügen.
2. **Preferences: Open Keyboard Shortcuts (JSON)** öffnen und den Eintrag aus `vscode/keybindings.json` zur vorhandenen Liste hinzufügen.
3. Markdown-Datei öffnen, speichern und **⌘⌥M** drücken. Danach aktualisiert Speichern mit **⌘S** die Vorschau.

Der Task verwendet getrennte Prozessargumente, sodass Leerzeichen und Sonderzeichen im Dateipfad funktionieren. Der Fokus bleibt durch `open -g` im Editor. Bei Bedarf MD Preview daneben platzieren. Die Dateien sind Vorlagen; sie wurden nicht in deine Editor-Konfiguration installiert.

Optional kann in VS Code Auto Save aktiviert werden. Das speichert Änderungen tatsächlich auf die Festplatte; die Vorschau sieht keine ungespeicherten Textpuffer.

## Neovim / LazyVim → MD Preview

Den Inhalt aus `neovim/md-preview.lua` in `init.lua` bzw. LazyVims `lua/config/keymaps.lua` ergänzen. **<leader>mp** öffnet die aktuelle gespeicherte Datei in der Vorschau; **:w** aktualisiert sie.

**MD Preview → Neovim** startet ein neues macOS-Terminal-Fenster mit deiner vorhandenen Neovim-/LazyVim-Konfiguration. Es wird keine vorhandene Neovim-Sitzung fernbedient. Die App sucht `nvim` unter `/opt/homebrew/bin`, `/usr/local/bin`, `~/.local/bin` und `~/.local/share/bob/nvim-bin`. Für andere Installationsorte kann dort ein passender Symlink eingerichtet werden.

Wenn App oder SSD später anders heißen, den App-Pfad in beiden Vorlagen anpassen. Synchrones Scrollen und die Übertragung ungespeicherter Änderungen sind nicht enthalten.

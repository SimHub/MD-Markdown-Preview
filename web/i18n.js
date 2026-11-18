const translations = {
  de: {
    openFilesBtn: '＋ Dateien öffnen',
    backToMain: '← Zur Hauptansicht',
    viewPreview: 'Lesen',
    viewSplit: 'Geteilt',
    viewSource: 'Quelltext',
    dualOpen: '▥ Zwei Dateien',
    compareOpen: '⇄ Diff',
    openEditor: '↗ Editor',
    exportPdf: 'PDF ↗',
    langToggle: 'DE',

    tipSidebar: 'Seitenleiste ein-/ausblenden',
    tipBackToMain: 'Zur Hauptansicht zurückkehren (Esc)',
    tipDualOpen: 'Zwei Dateien gleichzeitig lesen (⇧⌘2)',
    tipCompareOpen: 'Dateien vergleichen (⇧⌘D)',
    tipOpenEditor: 'Im Editor öffnen (⌘E)',
    tipExportPdf: 'Als PDF exportieren (⇧⌘E)',
    tipRefresh: 'Datei und Bilder neu laden (⌘R)',
    tipBookmarkAdd: 'Lesezeichen hinzufügen',
    tipBookmarkRemove: 'Lesezeichen entfernen',
    tipSettings: 'Einstellungen',
    tipTheme: 'Farbschema wechseln',
    tipLang: 'Sprache: Deutsch / English',
    tipFocus: 'Fokusmodus (Esc)',
    tipClearHistory: 'Verlauf löschen',
    tipSwapCompare: 'Vorher und Nachher tauschen',
    tipClearLeft: 'Erste Datei entfernen',
    tipClearRight: 'Zweite Datei entfernen',
    tipClearSession: 'Letzte Sitzung dieses Bereichs löschen',
    tipRemoveHistory: 'Aus Verlauf entfernen',
    tipCloseFile: 'Datei schließen',

    secDocument: 'DOKUMENT',
    secOpen: 'GEÖFFNET',
    secOutline: 'IN DIESEM DOKUMENT',
    secBookmarks: 'LESEZEICHEN',
    secHistory: 'ZULETZT GEÖFFNET',
    clearBtn: 'Löschen',
    batchOpen: 'Mehrere als PDF …',
    asideBottom: 'Lokal. Einfach. Dein Markdown.',

    breadcrumbPlain: 'DOKUMENT / KLARTEXT',
    breadcrumbPreview: 'DOKUMENT / VORSCHAU',
    plainNoHeadings: 'Klartext · keine Überschriften',
    wordsMinRead: (words, mins) => `${words} Wörter  ·  ${mins} Min. Lesezeit`,
    statusReady: 'Bereit',
    statusUpdated: time => `Aktualisiert · ${time}`,
    statusReloading: 'Wird neu geladen …',
    statusPreparingPdf: 'PDF wird vorbereitet …',
    startedApp: path => `Gestartete App: ${path}`,

    emptyBookmarks: 'Wichtige Dateien mit ☆ merken.',
    emptyHistory: 'Noch keine Dateien geöffnet.',
    emptyOpenFiles: 'Mehrere Dateien hier hineinziehen oder mit ⌘O auswählen.',

    settingsTitle: 'Einstellungen',
    resumeLabel: 'Beim Start fortsetzen',
    resumeDesc: 'Öffnet das letzte Dokument an deiner Lesestelle. Gezielt geöffnete Dateien haben Vorrang.',
    editorLabel: 'Bevorzugter Editor',
    editorCustomOpt: 'Andere App auswählen …',
    editorCustomChange: app => `${app} · ändern …`,
    editorHint: 'Die Vorschau aktualisiert sich nach dem Speichern. Neovim startet in einem neuen Terminal-Fenster mit deiner vorhandenen Konfiguration.',
    settingsNote: 'Lesestellen werden pro Datei gespeichert. „Verlauf löschen“ entfernt auch die Lesestellen unmarkierter Dateien. Lesezeichen bleiben erhalten.',

    batchTitle: 'Dateien als PDF exportieren',
    batchDesc: 'Auswählen und mit ↑ / ↓ in die gewünschte Reihenfolge bringen. Jede Datei beginnt in der gemeinsamen PDF auf einer neuen Seite.',
    batchSelectAll: 'Alle auswählen',
    batchSelectedCount: n => `${n} ausgewählt`,
    batchSeparate: 'Einzelne PDFs …',
    batchMerge: 'Eine gemeinsame PDF …',
    batchNote: 'Einzelne PDFs: Zielordner wählen. Vorhandene Dateien bleiben erhalten; gleiche Namen erhalten einen Zahlenzusatz. Exportiert wird die aktuelle Fassung von der SSD.',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',

    compareTitle: 'Vergleich & Review',
    comparePick: 'Dateien wählen …',
    compareSwap: '⇄ Tauschen',
    compareReload: '↻ Neu vergleichen',
    compareLevelLabel: 'Textvergleich',
    levelOff: 'Aus',
    levelWords: 'Wörter',
    levelChars: 'Zeichen',
    levelSentences: 'Sätze',
    levelParagraphs: 'Absätze',
    compareRun: 'Vergleichen',
    compareViewLabel: 'Ansicht',
    viewUnified: 'Diff untereinander',
    viewSplitDiff: 'Diff nebeneinander',
    viewDocsSide: 'Dokumente nebeneinander',
    viewDocsStacked: 'Dokumente untereinander',
    compareLeftDefault: 'Vorher auswählen …',
    compareRightDefault: 'Nachher auswählen …',
    compareSummaryDefault: 'Zwei Text- oder Codedateien auswählen.',
    sessionClear: 'Letzte Sitzung löschen',
    reviewClear: 'Review löschen',
    compareEmptyTitle: 'Dateien vergleichen, Änderungen prüfen und kommentieren.',
    compareEmptySub: 'Markdown, TXT und UTF-8-Codedateien. Grün = hinzugefügt, Rot = entfernt. Dateien bleiben unverändert.',
    compareFooter: 'Review-Notizen werden lokal für genau diese Dateiversionen gespeichert (zuletzt 20 Reviews). Neu vergleichen lädt beide Dateien erneut ein.',
    dropOverlay: 'Dateien hier ablegen',
    tipFindOpen: 'Im Dokument suchen (⌘F)',
    searchPlaceholder: 'Im Dokument suchen …',
    tipSearchPrev: 'Vorheriger Treffer (⇧Enter)',
    tipSearchNext: 'Nächster Treffer (Enter)',
    tipSearchClose: 'Suche schließen (Esc)',
    searchScopeCurrent: 'Dokument',
    searchScopeAll: 'Alle Dateien',
    searchAllPlaceholder: 'Dateinamen & offene Dateien durchsuchen …',
    searchFilesSection: 'DATEINAMEN',
    searchContentSection: 'TREFFER IN OFFENEN DATEIEN',
    searchNoGlobalResults: 'Keine passenden Dateinamen oder Textstellen gefunden.',
    searchBadgeOpen: 'Geöffnet',
    searchBadgeBookmark: 'Lesezeichen',
    searchBadgeHistory: 'Verlauf',
    searchLine: n => `Zeile ${n}`,
    errReloadDesktop: 'Neu laden ist in der Desktop-App verfügbar.',
    errPdfDesktop: 'PDF-Export ist in der Desktop-App verfügbar.',
    welcomeName: 'Willkommen.md',

    cmpPatchFail: 'Die Dateien unterscheiden sich zu stark für den schnellen Vergleich. Bitte kleinere Dateien oder Abschnitte wählen.',
    cmpTooManyLines: 'Zu viele geänderte Zeilen für diese Ansicht. Bitte kleinere Dateien vergleichen.',
    cmpReadingTitle: 'Zwei Dateien lesen',
    cmpReadingReload: '↻ Neu laden',
    cmpReadingFooter: 'Beide Dokumente sind vollständig und unabhängig scrollbar. Markdown wird formatiert; Text und Code erscheinen als Klartext. Neu laden liest beide Dateien erneut ein.',
    cmpReadingSummary: 'Zwei vollständige Dateien · unabhängig scrollbar',
    cmpSessionRestored: 'Letzte Sitzung wiederhergestellt',
    cmpSessionRestoring: 'Letzte Sitzung wird wiederhergestellt …',
    cmpSessionCleared: 'Letzte Sitzung gelöscht.',
    cmpTextOff: 'Textvergleich ist ausgeschaltet. Wörter, Zeichen, Sätze oder Absätze wählen und auf Vergleichen klicken.',
    cmpNoTextFound: 'In diesen Dateien wurden keine auswertbaren Textstellen gefunden.',
    cmpRelEqual: 'Gleich',
    cmpRelSimilar: 'Ähnlich',
    cmpRelDifferent: 'Unterschiedlich',
    cmpRelOnly: 'Nur hier',
    cmpJumpTitle: 'Klicken: Gegenstelle in der anderen Datei anzeigen',
    cmpNoCounterpartTitle: 'Diese Stelle hat keine zugeordnete Gegenstelle.',
    cmpJumpAria: avail => avail ? ': Gegenstelle in der anderen Datei anzeigen' : ': keine Gegenstelle in der anderen Datei',
    cmpReadingLeft: 'Links',
    cmpReadingRight: 'Rechts',
    cmpReadingTop: 'Oben',
    cmpReadingBottom: 'Unten',
    cmpDiffBefore: 'Vorher',
    cmpDiffAfter: 'Nachher',
    cmpSelectSide: label => `${label} auswählen …`,
    cmpDropHint: path => `${path || 'Datei auswählen'} · Einzelne Datei hier hineinziehen`,
    cmpLoadingFiles: 'Dateien werden eingelesen …',
    cmpNewSelection: 'Neue Dateiauswahl',
    cmpNoComparison: 'Kein aktueller Vergleich. Bitte beide Dateien erneut einlesen.',
    cmpLimited: 'Vergleich begrenzt',
    cmpReviewRestored: 'Review wiederhergestellt',
    cmpDiffSummary: (hunks, added, removed) => `${hunks} Änderungsblöcke · +${added} −${removed} Zeilen`,
    cmpNoChanges: 'Keine Änderungen zwischen beiden Dateien gefunden.',
    cmpReviewed: 'Geprüft',
    cmpReviewNoteLabel: n => `Review-Notiz zu Änderung ${n}`,
    cmpReviewPlaceholder: 'Beobachtung, Frage oder Verbesserungsvorschlag …',
    cmpTextMsgDone: (level, eq, sim, diff, only) => `Textvergleich (${level}): ${eq} gleich, ${sim} ähnlich, ${diff} unterschiedlich, ${only} nur einseitig — Vergleich abgeschlossen.`,
    cmpTextSummary: (eq, sim, diff, only) => `${eq} gleich · ${sim} ähnlich · ${diff} unterschiedlich · ${only} nur hier`,
    cmpNoChangesFound: 'Keine Unterschiede im Text gefunden.',
    cmpNoLines: 'keine Zeilen',
    cmpTextLimitErr: 'Textvergleich auf insgesamt 40.000 Textblöcke und 4 Millionen Zeichen begrenzt.',
    cmpMarkLeft: 'Text nur hier bzw. geändert',
    cmpMarkRight: 'Neuer bzw. geänderter Text',
    cmpMissingCounterpart: 'Für diese Stelle gibt es keine Gegenstelle in der anderen Datei.',
    cmpPartialHint: 'Zweite Datei auswählen oder hineinziehen, um beide Dokumente zu vergleichen.'
  },
  en: {
    openFilesBtn: '＋ Open Files',
    backToMain: '← Back to Reader',
    viewPreview: 'Read',
    viewSplit: 'Split',
    viewSource: 'Source',
    dualOpen: '▥ Two Files',
    compareOpen: '⇄ Diff',
    openEditor: '↗ Editor',
    exportPdf: 'PDF ↗',
    langToggle: 'EN',

    tipSidebar: 'Toggle sidebar',
    tipBackToMain: 'Back to main view (Esc)',
    tipDualOpen: 'Read two files side by side (⇧⌘2)',
    tipCompareOpen: 'Compare files (⇧⌘D)',
    tipOpenEditor: 'Open in editor (⌘E)',
    tipExportPdf: 'Export as PDF (⇧⌘E)',
    tipRefresh: 'Reload file and images (⌘R)',
    tipBookmarkAdd: 'Add bookmark',
    tipBookmarkRemove: 'Remove bookmark',
    tipSettings: 'Settings',
    tipTheme: 'Switch color theme',
    tipLang: 'Language: English / Deutsch',
    tipFocus: 'Focus mode (Esc)',
    tipClearHistory: 'Clear history',
    tipSwapCompare: 'Swap before and after',
    tipClearLeft: 'Remove first file',
    tipClearRight: 'Remove second file',
    tipClearSession: 'Clear last session for this view',
    tipRemoveHistory: 'Remove from history',
    tipCloseFile: 'Close file',

    secDocument: 'DOCUMENT',
    secOpen: 'OPEN',
    secOutline: 'IN THIS DOCUMENT',
    secBookmarks: 'BOOKMARKS',
    secHistory: 'RECENTLY OPENED',
    clearBtn: 'Clear',
    batchOpen: 'Export multiple as PDF …',
    asideBottom: 'Local. Simple. Your Markdown.',

    breadcrumbPlain: 'DOCUMENT / PLAIN TEXT',
    breadcrumbPreview: 'DOCUMENT / PREVIEW',
    plainNoHeadings: 'Plain text · no headings',
    wordsMinRead: (words, mins) => `${words} words  ·  ${mins} min read`,
    statusReady: 'Ready',
    statusUpdated: time => `Updated · ${time}`,
    statusReloading: 'Reloading …',
    statusPreparingPdf: 'Preparing PDF …',
    startedApp: path => `Running app: ${path}`,

    emptyBookmarks: 'Pin important files with ☆.',
    emptyHistory: 'No files opened yet.',
    emptyOpenFiles: 'Drop multiple files here or choose with ⌘O.',

    settingsTitle: 'Settings',
    resumeLabel: 'Resume on launch',
    resumeDesc: 'Reopens the last document at your reading position. Explicitly opened files take precedence.',
    editorLabel: 'Preferred Editor',
    editorCustomOpt: 'Choose another app …',
    editorCustomChange: app => `${app} · change …`,
    editorHint: 'Preview updates automatically on save. Neovim launches in a new Terminal window using your existing config.',
    settingsNote: 'Reading positions are saved per file. “Clear history” also removes positions for unbookmarked files. Bookmarks are kept.',

    batchTitle: 'Export files as PDF',
    batchDesc: 'Select files and reorder with ↑ / ↓. Each file starts on a new page in a merged PDF.',
    batchSelectAll: 'Select all',
    batchSelectedCount: n => `${n} selected`,
    batchSeparate: 'Separate PDFs …',
    batchMerge: 'One merged PDF …',
    batchNote: 'Separate PDFs: choose target folder. Existing files are preserved; duplicate names receive a numeric suffix. Exports the current version from disk.',
    moveUp: 'Move up',
    moveDown: 'Move down',

    compareTitle: 'Compare & Review',
    comparePick: 'Choose files …',
    compareSwap: '⇄ Swap',
    compareReload: '↻ Recompare',
    compareLevelLabel: 'Text diff',
    levelOff: 'Off',
    levelWords: 'Words',
    levelChars: 'Characters',
    levelSentences: 'Sentences',
    levelParagraphs: 'Paragraphs',
    compareRun: 'Compare',
    compareViewLabel: 'View',
    viewUnified: 'Unified diff',
    viewSplitDiff: 'Side-by-side diff',
    viewDocsSide: 'Documents side by side',
    viewDocsStacked: 'Documents stacked',
    compareLeftDefault: 'Select before …',
    compareRightDefault: 'Select after …',
    compareSummaryDefault: 'Select two text or code files.',
    sessionClear: 'Clear last session',
    reviewClear: 'Clear review',
    compareEmptyTitle: 'Compare files, review changes, and add notes.',
    compareEmptySub: 'Markdown, TXT, and UTF-8 code files. Green = added, red = removed. Files remain unchanged.',
    compareFooter: 'Review notes are stored locally for these exact file versions (last 20 reviews). Recompare reloads both files from disk.',
    dropOverlay: 'Drop files here',
    tipFindOpen: 'Find in document (⌘F)',
    searchPlaceholder: 'Find in document …',
    tipSearchPrev: 'Previous match (⇧Enter)',
    tipSearchNext: 'Next match (Enter)',
    tipSearchClose: 'Close search (Esc)',
    searchScopeCurrent: 'Document',
    searchScopeAll: 'All Files',
    searchAllPlaceholder: 'Search filenames & open files …',
    searchFilesSection: 'FILENAMES',
    searchContentSection: 'MATCHES IN OPEN FILES',
    searchNoGlobalResults: 'No matching filenames or text found.',
    searchBadgeOpen: 'Open',
    searchBadgeBookmark: 'Bookmark',
    searchBadgeHistory: 'History',
    searchLine: n => `Line ${n}`,
    errReloadDesktop: 'Reloading is only available in the desktop app.',
    errPdfDesktop: 'PDF export is only available in the desktop app.',
    welcomeName: 'Welcome.md',

    cmpPatchFail: 'The files differ too much for a fast diff. Please select smaller files or sections.',
    cmpTooManyLines: 'Too many changed lines for this view. Please compare smaller files.',
    cmpReadingTitle: 'Read Two Files',
    cmpReadingReload: '↻ Reload',
    cmpReadingFooter: 'Both documents are complete and scroll independently. Markdown is formatted; plain text and code appear as source. Reload reads both files again from disk.',
    cmpReadingSummary: 'Two full files · independent scrolling',
    cmpSessionRestored: 'Last session restored',
    cmpSessionRestoring: 'Restoring last session …',
    cmpSessionCleared: 'Last session cleared.',
    cmpTextOff: 'Text comparison is off. Choose Words, Characters, Sentences, or Paragraphs and click Compare.',
    cmpNoTextFound: 'No comparable text blocks found in these files.',
    cmpRelEqual: 'Equal',
    cmpRelSimilar: 'Similar',
    cmpRelDifferent: 'Different',
    cmpRelOnly: 'Only here',
    cmpJumpTitle: 'Click: jump to counterpart in the other file',
    cmpNoCounterpartTitle: 'This passage has no matching counterpart.',
    cmpJumpAria: avail => avail ? ': jump to counterpart in the other file' : ': no counterpart in the other file',
    cmpReadingLeft: 'Left',
    cmpReadingRight: 'Right',
    cmpReadingTop: 'Top',
    cmpReadingBottom: 'Bottom',
    cmpDiffBefore: 'Before',
    cmpDiffAfter: 'After',
    cmpSelectSide: label => `Select ${label.toLowerCase()} …`,
    cmpDropHint: path => `${path || 'Select file'} · Drop a single file here`,
    cmpLoadingFiles: 'Loading files …',
    cmpNewSelection: 'New file selection',
    cmpNoComparison: 'No active comparison. Please reload both files.',
    cmpLimited: 'Comparison limited',
    cmpReviewRestored: 'Review restored',
    cmpDiffSummary: (hunks, added, removed) => `${hunks} hunks · +${added} −${removed} lines`,
    cmpNoChanges: 'No changes found between the two files.',
    cmpReviewed: 'Reviewed',
    cmpReviewNoteLabel: n => `Review note for change ${n}`,
    cmpReviewPlaceholder: 'Observation, question, or suggestion …',
    cmpTextMsgDone: (level, eq, sim, diff, only) => `Text comparison (${level}): ${eq} equal, ${sim} similar, ${diff} different, ${only} one-sided — comparison complete.`,
    cmpTextSummary: (eq, sim, diff, only) => `${eq} equal · ${sim} similar · ${diff} different · ${only} only here`,
    cmpNoChangesFound: 'No text differences found.',
    cmpNoLines: 'no lines',
    cmpTextLimitErr: 'Text comparison is limited to 40,000 text blocks and 4 million characters total.',
    cmpMarkLeft: 'Text only here or changed',
    cmpMarkRight: 'Added or changed text',
    cmpMissingCounterpart: 'There is no counterpart for this passage in the other file.',
    cmpPartialHint: 'Select or drop a second file to compare both documents.'
  }
};

export function getLang() {
  return typeof document !== 'undefined' && document.documentElement?.lang === 'en' ? 'en' : 'de';
}

export function getStoredLang() {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}

export function t(lang, key, ...args) {
  const dict = translations[lang] || translations.de;
  const val = dict[key] ?? translations.de[key];
  return typeof val === 'function' ? val(...args) : val;
}

function setTip(el, text) {
  if (!el) return;
  if (el.hasAttribute('data-tooltip')) el.setAttribute('data-tooltip', text);
  else el.setAttribute('title', text);
}

export function applyLanguageToDOM(doc, lang) {
  const dict = translations[lang] || translations.de;
  doc.documentElement.lang = lang;

  const setText = (sel, text) => {
    const el = doc.querySelector(sel);
    if (el) el.textContent = text;
  };
  const setTipSel = (sel, text) => setTip(doc.querySelector(sel), text);

  // Header
  const openBtn = doc.querySelector('#open');
  if (openBtn && openBtn.firstChild) openBtn.firstChild.textContent = dict.openFilesBtn + ' ';
  setText('#compare-close', dict.backToMain);
  setText('nav [data-view="preview"]', dict.viewPreview);
  setText('nav [data-view="split"]', dict.viewSplit);
  setText('nav [data-view="source"]', dict.viewSource);
  setText('#dual-open', dict.dualOpen);
  setText('#compare-open', dict.compareOpen);
  setText('#open-editor', dict.openEditor);
  setText('#export-pdf', dict.exportPdf);
  setText('#lang-toggle', dict.langToggle);

  setTipSel('#sidebar', dict.tipSidebar);
  setTipSel('#compare-close', dict.tipBackToMain);
  setTipSel('#dual-open', dict.tipDualOpen);
  setTipSel('#compare-open', dict.tipCompareOpen);
  setTipSel('#open-editor', dict.tipOpenEditor);
  setTipSel('#export-pdf', dict.tipExportPdf);
  setTipSel('#refresh', dict.tipRefresh);
  const bm = doc.querySelector('#bookmark');
  if (bm) setTip(bm, bm.getAttribute('aria-pressed') === 'true' ? dict.tipBookmarkRemove : dict.tipBookmarkAdd);
  setTipSel('#settings', dict.tipSettings);
  setTipSel('#theme', dict.tipTheme);
  setTipSel('#lang-toggle', dict.tipLang);
  setTipSel('#focus', dict.tipFocus);

  // Sidebar
  const docLabel = doc.querySelector('aside > .section-label');
  if (docLabel && docLabel.firstChild) docLabel.firstChild.textContent = dict.secDocument + ' ';
  const openLabel = doc.querySelector('.open-files-section .section-label');
  if (openLabel && openLabel.firstChild) openLabel.firstChild.textContent = dict.secOpen + ' ';
  setText('.outline-label', dict.secOutline);
  const sections = doc.querySelectorAll('aside .library-section .section-label');
  if (sections[1]) sections[1].textContent = dict.secBookmarks;
  if (sections[2] && sections[2].firstChild) sections[2].firstChild.textContent = dict.secHistory + ' ';
  setText('#clear-history', dict.clearBtn);
  setTipSel('#clear-history', dict.tipClearHistory);
  setText('#batch-open', dict.batchOpen);
  const asideBottom = doc.querySelector('.aside-bottom');
  if (asideBottom && asideBottom.lastChild) asideBottom.lastChild.textContent = ' ' + dict.asideBottom;

  // Settings
  const settingsTitle = doc.querySelector('#settings-panel .settings-title');
  if (settingsTitle && settingsTitle.firstChild) settingsTitle.firstChild.textContent = dict.settingsTitle + ' ';
  const resumeLabel = doc.querySelector('#settings-panel > label');
  if (resumeLabel && resumeLabel.lastChild) resumeLabel.lastChild.textContent = ' ' + dict.resumeLabel;
  setText('#settings-panel > p', dict.resumeDesc);
  setText('label[for="preferred-editor"]', dict.editorLabel);
  setText('#preferred-editor option[value="custom"]', dict.editorCustomOpt);
  setText('#editor-hint', dict.editorHint);
  setText('.settings-note', dict.settingsNote);

  // Batch PDF dialog
  setText('#batch-title', dict.batchTitle);
  setText('#batch-dialog > p:first-of-type', dict.batchDesc);
  setText('#batch-select-all', dict.batchSelectAll);
  setText('#batch-separate', dict.batchSeparate);
  setText('#batch-merge', dict.batchMerge);
  setText('#batch-dialog .batch-note', dict.batchNote);

  // Comparison view
  setText('#comparison-title', dict.compareTitle);
  setText('#compare-pick', dict.comparePick);
  setText('#compare-swap', dict.compareSwap);
  setTipSel('#compare-swap', dict.tipSwapCompare);
  setText('#compare-reload', dict.compareReload);
  const tcLabel = doc.querySelector('#text-compare-controls');
  if (tcLabel && tcLabel.firstChild) tcLabel.firstChild.textContent = dict.compareLevelLabel + ' ';
  setText('#text-compare-level option[value="off"]', dict.levelOff);
  setText('#text-compare-level option[value="words"]', dict.levelWords);
  setText('#text-compare-level option[value="chars"]', dict.levelChars);
  setText('#text-compare-level option[value="sentences"]', dict.levelSentences);
  setText('#text-compare-level option[value="paragraphs"]', dict.levelParagraphs);
  setText('#text-compare-run', dict.compareRun);
  const viewLabels = doc.querySelectorAll('.compare-toolbar label');
  if (viewLabels[1] && viewLabels[1].firstChild) viewLabels[1].firstChild.textContent = dict.compareViewLabel + ' ';
  setText('#compare-view option[value="unified"]', dict.viewUnified);
  setText('#compare-view option[value="split"]', dict.viewSplitDiff);
  setText('#compare-view option[value="documents-side"]', dict.viewDocsSide);
  setText('#compare-view option[value="documents-stacked"]', dict.viewDocsStacked);
  setTipSel('#compare-clear-left', dict.tipClearLeft);
  setTipSel('#compare-clear-right', dict.tipClearRight);
  setText('#session-clear', dict.sessionClear);
  setTipSel('#session-clear', dict.tipClearSession);
  setText('#review-clear', dict.reviewClear);
  setText('#comparison-footer', dict.compareFooter);

  const emptyDiv = doc.querySelector('#comparison-content .compare-empty');
  if (emptyDiv && emptyDiv.firstChild) {
    emptyDiv.firstChild.textContent = dict.compareEmptyTitle;
    const p = emptyDiv.querySelector('p');
    if (p) p.textContent = dict.compareEmptySub;
  }

  const drop = doc.querySelector('#drop-overlay');
  if (drop && drop.firstChild) drop.firstChild.textContent = dict.dropOverlay;

  // Search bar
  setTipSel('#find-open', dict.tipFindOpen);
  setText('#search-scope [data-scope="current"]', dict.searchScopeCurrent);
  setText('#search-scope [data-scope="all"]', dict.searchScopeAll);
  const searchInput = doc.querySelector('#search-input');
  if (searchInput) {
    const isAll = doc.querySelector('#search-scope [data-scope="all"]')?.classList.contains('active');
    searchInput.placeholder = isAll ? dict.searchAllPlaceholder : dict.searchPlaceholder;
  }
  setTipSel('#search-prev', dict.tipSearchPrev);
  setTipSel('#search-next', dict.tipSearchNext);
  setTipSel('#search-close', dict.tipSearchClose);
}

import {initComparison} from './comparison.js';
import {getStoredLang,t,applyLanguageToDOM} from './i18n.js';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';
const $ = s => document.querySelector(s);
const md = new MarkdownIt({html:false,linkify:true,typographer:true,highlight:(code,lang)=>lang && hljs.getLanguage(lang)?hljs.highlight(code,{language:lang}).value:md.utils.escapeHtml(code)});
let imageRevision=0, lang=getStoredLang();
let text='', name='Willkommen.md', currentView='preview', fontSize=17;
const sample = `# Ein guter Platz für deine Gedanken.

Markdown öffnen. In Ruhe lesen. **Auf das Wesentliche konzentrieren.**

Ob README, Projektnotizen oder die nächste große Idee: Hier bekommen deine Texte den Platz, den sie verdienen.

> Weniger Oberfläche. Mehr Inhalt. Deine Dateien bleiben bei dir.

## Ankommen & loslegen

Öffne eine Markdown-Datei mit **⌘O** oder ziehe sie direkt in dieses Fenster. Wenn du die Datei in deinem Editor speicherst, aktualisiert sich die Vorschau automatisch.

## Alles, was du zum Lesen brauchst

| Funktion | Für deinen Arbeitsfluss |
| :--- | :--- |
| **Klare Vorschau** | Überschriften, Listen, Tabellen und Bilder |
| **Inhaltsverzeichnis** | Mit einem Klick zur richtigen Stelle |
| **Geteilte Ansicht** | Markdown und Ergebnis nebeneinander |
| **Hell & Dunkel** | Ein angenehmes Bild zu jeder Tageszeit |

## Auch Code darf gut aussehen

\`\`\`typescript
const gedanke = { titel: "Weniger, aber besser", bereit: true };

function loslegen() {
  return gedanke.titel;
}
\`\`\`

## Dein nächster Schritt

- Öffne deine erste Datei.
- Wähle deine Lieblingsansicht.
- Mach es dir beim Lesen bequem.

---

*Ein kleines Werkzeug. Viel Raum für deine Ideen.*
`;
const sampleEn = `# A calm space for your thoughts.

Open Markdown. Read in peace. **Focus on what matters.**

Whether it's a README, project notes, or your next big idea: here your writing gets the space it deserves.

> Less interface. More content. Your files stay with you.

## Getting started

Open a Markdown file with **⌘O** or drop it straight into this window. Whenever you save the file in your editor, the preview updates automatically.

## Everything you need for reading

| Feature | For your workflow |
| :--- | :--- |
| **Clean Preview** | Headings, lists, tables, callouts, and images |
| **Table of Contents** | Jump to any section with a single click |
| **Split View** | Markdown source and rendered preview side by side |
| **Light & Dark** | Comfortable reading at any time of day |

## Code looks great too

\`\`\`typescript
const thought = { title: "Less, but better", ready: true };

function start() {
  return thought.title;
}
\`\`\`

## Your next step

- Open your first file.
- Pick your favorite view.
- Make yourself comfortable.

---

*A small tool. Plenty of room for your ideas.*
`;
function enhanceMarkdown(container){
 const alerts={NOTE:['ℹ','Note'],TIP:['✦','Tip'],IMPORTANT:['⚑','Important'],WARNING:['⚠','Warning'],CAUTION:['⛔','Caution']};
 container.querySelectorAll('li').forEach(li=>{
  const target=li.firstElementChild?.tagName==='P'?li.firstElementChild:li;
  const first=target.firstChild;
  if(!first||first.nodeType!==3)return;
  const match=first.nodeValue.match(/^\[([ xX])\]\s+/);
  if(!match)return;
  li.classList.add('task-list-item');
  const box=document.createElement('input');
  box.type='checkbox';box.className='task-list-item-checkbox';box.disabled=true;box.checked=match[1]!==' ';
  first.nodeValue=first.nodeValue.slice(match[0].length);
  target.insertBefore(box,first);
 });
 container.querySelectorAll('blockquote').forEach(bq=>{
  const firstP=bq.firstElementChild;
  if(!firstP||firstP.tagName!=='P')return;
  const firstNode=firstP.firstChild;
  if(!firstNode||firstNode.nodeType!==3)return;
  const match=firstNode.nodeValue.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n?|\s+)/);
  if(!match)return;
  const key=match[1];
  bq.classList.add('gfm-alert','gfm-alert-'+key.toLowerCase());
  const title=document.createElement('div');title.className='gfm-alert-title';
  const [icon,label]=alerts[key];
  title.textContent=icon+' '+label;
  firstNode.nodeValue=firstNode.nodeValue.slice(match[0].length);
  if(!firstNode.nodeValue&&firstP.childNodes.length===1)firstP.remove();
  bq.insertBefore(title,bq.firstChild);
 });
}
function render(content,filename,changed=false){
 const reader=$('#reader'), pos=reader.scrollTop; text=content;name=filename;
 const plain=filename.toLowerCase().endsWith('.txt');
 $('#document').classList.toggle('plain-text',plain);
 if(plain){const pre=document.createElement('pre');pre.className='plain-content';pre.textContent=content;$('#document').replaceChildren(pre);}
 else{$('#document').innerHTML=DOMPurify.sanitize(md.render(content));enhanceMarkdown($('#document'));}
 $('#breadcrumb').textContent=t(lang,plain?'breadcrumbPlain':'breadcrumbPreview');
 document.querySelectorAll('article img').forEach(img=>{const src=img.getAttribute('src');if(src && window.documentBase && !/^[a-z][a-z0-9+.-]*:|^\/\//i.test(src)){const url=new URL(src,window.documentBase);if(imageRevision)url.searchParams.set('_mdpreview',String(imageRevision));img.src=url.href;}});
 $('#source').textContent=content; const fn=$('#filename');fn.textContent=filename;fn.title=filename;$('#side-name').textContent=filename;
 $('#outline').replaceChildren();
 if(plain){const p=document.createElement('p');p.className='library-empty';p.textContent=t(lang,'plainNoHeadings');$('#outline').append(p);}
 document.querySelectorAll('article h1,article h2,article h3').forEach((h,i)=>{h.id='heading-'+i;const b=document.createElement('button');b.textContent=h.textContent;b.className='level-'+h.tagName[1];b.onclick=()=>{h.scrollIntoView({behavior:'smooth',block:'start'});document.querySelectorAll('#outline button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');};$('#outline').append(b);});
 document.querySelectorAll('article a').forEach(a=>{if(a.getAttribute('href')?.startsWith('#')){a.onclick=e=>{e.preventDefault();const target=Array.from(document.querySelectorAll('article h1,article h2,article h3')).find(h=>h.textContent.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s+/g,'-')===decodeURIComponent(a.hash.slice(1)));target?.scrollIntoView({behavior:'smooth'});};}});
 const words=content.trim().split(/\s+/).filter(Boolean).length;$('#stats').textContent=t(lang,'wordsMinRead',words,Math.max(1,Math.ceil(words/220)));
 $('#status').textContent=changed?t(lang,'statusUpdated',new Date().toLocaleTimeString(lang==='en'?'en-US':'de-DE',{hour:'2-digit',minute:'2-digit'})):t(lang,'statusReady');
 reader.scrollTop=changed?pos:0;
}
window.loadDocument=(content,filename,changed=false,options={})=>{
 if(!changed){window.flushPosition();documentPath=options.path||null;lastPosition=options.position||null;}
 const position=changed?capturePosition():options.position;
 if(options.refreshImages)imageRevision++;
 else if(!changed)imageRevision=0;
 restoring=true;render(content,filename,changed);
 if(!changed)setView(position?.view||'preview');
 restorePosition(position);
 requestAnimationFrame(()=>{restoring=false;});
 // Images can change the document height after the initial layout.
 const path=documentPath;
 document.querySelectorAll('article img').forEach(img=>img.addEventListener('load',()=>{if(documentPath===path&&!interacted)restorePosition(position);},{once:true}));
 interacted=false;
 if(pendingSearchJump&&(!pendingSearchJump.path||pendingSearchJump.path===documentPath)){const q=pendingSearchJump.query;pendingSearchJump=null;setSearchScope('current');$('#search-bar').hidden=false;$('#search-input').value=q;runSearch(q);}
};
window.showWelcome=()=>{window.flushPosition();documentPath=null;window.documentBase=null;setView('preview');render(sample,'Willkommen.md');};
window.setAppInfo=(version,path)=>{$('#app-version').textContent='MD Preview '+version;$('#app-version').title='Gestartete App: '+path;};
window.showError=message=>{$('#status').textContent=message;};
function native(action,details={}){const bridge=window.webkit?.messageHandlers?.native;if(bridge){bridge.postMessage({action,...details});return true;}return false;}
$('#open').onclick=()=>{if(!native('open'))$('#file-input').click();};
$('#file-input').onchange=async e=>{const f=e.target.files[0];if(f)render(await f.text(),f.name);};
$('#sidebar').onclick=()=>document.body.classList.toggle('hide-sidebar');$('#focus').onclick=()=>document.body.classList.toggle('focus');
let theme=localStorage.getItem('theme')|| (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
function setTheme(){document.documentElement.dataset.theme=theme;localStorage.setItem('theme',theme);}setTheme();
$('#theme').onclick=()=>{theme=theme==='dark'?'light':'dark';setTheme();};
function resize(delta){fontSize=Math.max(13,Math.min(25,fontSize+delta));document.documentElement.style.setProperty('--reading-size',fontSize+'px');}
$('#smaller').onclick=()=>resize(-1);$('#larger').onclick=()=>resize(1);
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{const position=capturePosition();setView(b.dataset.view);restorePosition(position);window.flushPosition();});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&!e.shiftKey&&e.key.toLowerCase()==='e'){e.preventDefault();$('#open-editor').click();}if((e.metaKey||e.ctrlKey)&&e.shiftKey&&e.key.toLowerCase()==='e'){e.preventDefault();$('#export-pdf').click();}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='r'){e.preventDefault();$('#refresh').click();}if((e.metaKey||e.ctrlKey)&&e.key==='o'){e.preventDefault();$('#open').click();}if(e.key==='Escape')document.body.classList.remove('focus');});
let depth=0;document.addEventListener('dragenter',e=>{e.preventDefault();if(document.body.classList.contains('comparing'))return;depth++;$('#drop-overlay').classList.add('visible');});document.addEventListener('dragover',e=>e.preventDefault());document.addEventListener('dragleave',()=>{if(document.body.classList.contains('comparing'))return;if(--depth<=0)$('#drop-overlay').classList.remove('visible');});document.addEventListener('drop',async e=>{e.preventDefault();depth=0;$('#drop-overlay').classList.remove('visible');if(document.body.classList.contains('comparing'))return;const f=e.dataTransfer.files[0];if(f&&/\.(md|markdown|txt)$/i.test(f.name))render(await f.text(),f.name);});
let documentPath=null, library={history:[],bookmarks:[],resumeOnLaunch:true,current:null};
let lastPosition=null, positionTimer, restoring=false, interacted=false;
function setView(view){currentView=['preview','split','source'].includes(view)?view:'preview';$('#panes').dataset.view=currentView;document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));}
function capturePosition(){
 const reader=$('#reader'),source=$('#source');
 const position={heading:lastPosition?.heading||null,occurrence:lastPosition?.occurrence||0,offset:lastPosition?.offset||0,progress:lastPosition?.progress||0,sourceProgress:source.scrollTop/Math.max(1,source.scrollHeight-source.clientHeight),view:currentView};
 if(currentView!=='source'){
  position.progress=reader.scrollTop/Math.max(1,reader.scrollHeight-reader.clientHeight);
  const headings=[...document.querySelectorAll('article h1,article h2,article h3')];
  const edge=reader.getBoundingClientRect().top;
  const heading=headings.filter(h=>h.getBoundingClientRect().top<=edge+60).at(-1);
  if(heading){position.heading=heading.textContent;position.occurrence=headings.filter(h=>h.textContent===heading.textContent).indexOf(heading);position.offset=edge-heading.getBoundingClientRect().top;}
  else {position.heading=null;position.offset=0;}
 }
 lastPosition=position;return position;
}
function restorePosition(position){
 if(!position)return;
 const reader=$('#reader'),source=$('#source');
 const heading=[...document.querySelectorAll('article h1,article h2,article h3')].filter(h=>h.textContent===position.heading)[position.occurrence||0];
 const max=Math.max(0,reader.scrollHeight-reader.clientHeight);
 reader.scrollTop=Math.max(0,Math.min(max,heading&&currentView!=='source'?reader.scrollTop+heading.getBoundingClientRect().top-reader.getBoundingClientRect().top+(position.offset||0):(position.progress||0)*max));
 source.scrollTop=(position.sourceProgress||0)*Math.max(0,source.scrollHeight-source.clientHeight);
 lastPosition=position;
}
window.flushPosition=()=>{
 clearTimeout(positionTimer);
 if(!documentPath)return null;
 const snapshot={path:documentPath,position:capturePosition()};native('position',snapshot);return snapshot;
};
for(const pane of [$('#reader'),$('#source')])pane.addEventListener('scroll',()=>{if(restoring)return;clearTimeout(positionTimer);positionTimer=setTimeout(window.flushPosition,180);},{passive:true});
for(const event of ['wheel','pointerdown','keydown'])document.addEventListener(event,()=>{interacted=true;},{passive:true});
window.addEventListener('pagehide',()=>window.flushPosition());
function listFiles(selector,entries,bookmarkList){
 const container=$(selector);container.replaceChildren();
 if(!entries.length){const p=document.createElement('p');p.className='library-empty';p.textContent=t(lang,bookmarkList?'emptyBookmarks':'emptyHistory');container.append(p);return;}
 for(const entry of entries){
  const row=document.createElement('div');row.className='library-file';row.classList.toggle('current',entry.path===library.current);
  const open=document.createElement('button');open.className='library-open';open.title=entry.path;open.textContent=entry.path.split('/').pop();open.onclick=()=>{window.flushPosition();native('openRecent',{path:entry.path});};
  const remove=document.createElement('button');remove.className='library-remove';remove.textContent='×';remove.title=t(lang,bookmarkList?'tipBookmarkRemove':'tipRemoveHistory');remove.setAttribute('aria-label',`${remove.title}: ${open.textContent}`);remove.onclick=()=>native(bookmarkList?'removeBookmark':'removeHistory',{path:entry.path});
  row.append(open,remove);container.append(row);
 }
}
window.updateLibrary=state=>{
 library=state;$('#preferred-editor').value=state.editor||'vscode';$('#choose-editor-app').textContent=state.editorApp?t(lang,'editorCustomChange',state.editorApp):t(lang,'editorCustomOpt');$('#open-editor').disabled=!state.current||exporting;renderOpenFiles(state.openFiles||[]);listFiles('#bookmarks',state.bookmarks,true);listFiles('#history',state.history,false);
 const marked=state.bookmarks.some(entry=>entry.path===state.current),button=$('#bookmark');
 button.disabled=!state.current;button.textContent=marked?'★':'☆';button.setAttribute('aria-pressed',String(marked));const bmTip=t(lang,marked?'tipBookmarkRemove':'tipBookmarkAdd');if(button.hasAttribute('data-tooltip'))button.setAttribute('data-tooltip',bmTip);else button.title=bmTip;button.setAttribute('aria-label',bmTip);
 $('#refresh').disabled=!state.current||refreshing||exporting;
 $('#export-pdf').disabled=!state.current||exporting||refreshing;
 $('#batch-open').disabled=!(state.openFiles||[]).length||exporting||refreshing;
 $('#resume').checked=state.resumeOnLaunch;$('#clear-history').disabled=!state.history.length;
};
let refreshing=false,exporting=false;
window.setRefreshing=busy=>{$('#batch-open').disabled=busy||exporting||!(library.openFiles||[]).length;refreshing=busy;$('#refresh').disabled=busy||exporting||!library.current;$('#export-pdf').disabled=busy||exporting||!library.current;$('#refresh').classList.toggle('refreshing',busy);$('#refresh').setAttribute('aria-busy',String(busy));if(busy)$('#status').textContent=t(lang,'statusReloading');};
$('#refresh').onclick=()=>{window.flushPosition();window.setRefreshing(true);if(!native('refresh')){window.setRefreshing(false);window.showError('Neu laden ist in der Desktop-App verfügbar.');}};
window.setExporting=busy=>{$('#compare-open').disabled=busy;$('#dual-open').disabled=busy;$('#open-editor').disabled=busy||!library.current;$('#preferred-editor').disabled=busy;$('#choose-editor-app').disabled=busy;$('#batch-open').disabled=busy||refreshing||!(library.openFiles||[]).length;exporting=busy;$('#export-pdf').disabled=busy||refreshing||!library.current;$('#refresh').disabled=busy||refreshing||!library.current;$('#export-pdf').setAttribute('aria-busy',String(busy));if(busy)$('#status').textContent=t(lang,'statusPreparingPdf');};
window.preparePDF=()=>{window.flushPosition();return Promise.all([...document.querySelectorAll('article img')].map(img=>img.complete?Promise.resolve():Promise.race([new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});}),new Promise(resolve=>setTimeout(resolve,3000))]))).then(()=>document.fonts?.ready).then(()=>true);};
$('#export-pdf').onclick=()=>{window.flushPosition();window.setExporting(true);if(!native('exportPDF')){window.setExporting(false);window.showError('PDF-Export ist in der Desktop-App verfügbar.');}};
$('#open-editor').onclick=()=>{window.flushPosition();native('openEditor');};
$('#preferred-editor').onchange=e=>native('selectEditor',{editor:e.target.value});
$('#choose-editor-app').onclick=()=>native('selectEditor',{editor:'custom'});
$('#bookmark').onclick=()=>native('bookmark');
$('#clear-history').onclick=()=>{clearTimeout(positionTimer);native('clearHistory');};
function showSettings(show){$('#settings-panel').hidden=!show;$('#settings').setAttribute('aria-expanded',String(show));if(show)$('#resume').focus();}
$('#settings').onclick=()=>showSettings($('#settings-panel').hidden);$('#close-settings').onclick=()=>{showSettings(false);$('#settings').focus();};
$('#resume').onchange=e=>native('resume',{enabled:e.target.checked});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#settings-panel').hidden){showSettings(false);$('#settings').focus();}});
document.addEventListener('pointerdown',e=>{if(!$('#settings-panel').contains(e.target)&&!$('#settings').contains(e.target))showSettings(false);});
let exportOrder=[],exportSelected=new Set();
function renderOpenFiles(entries){
 const container=$('#open-files');container.replaceChildren();$('#open-count').textContent=entries.length;
 for(const entry of entries){const row=document.createElement('div');row.className='library-file';row.classList.toggle('current',entry.path===library.current);
 const open=document.createElement('button');open.className='library-open';open.textContent=entry.path.split('/').pop();open.title=entry.path;open.onclick=()=>{window.flushPosition();native('openDocument',{path:entry.path});};
 const close=document.createElement('button');close.className='library-remove';close.textContent='×';close.title=t(lang,'tipCloseFile');close.setAttribute('aria-label',t(lang,'tipCloseFile')+': '+open.textContent);close.onclick=()=>{window.flushPosition();native('closeDocument',{path:entry.path});};row.append(open,close);container.append(row);}
 if(!entries.length){const p=document.createElement('p');p.className='library-empty';p.textContent=t(lang,'emptyOpenFiles');container.append(p);}
}
function renderExportList(){
 const container=$('#batch-files');container.replaceChildren();
 exportOrder.forEach((path,index)=>{
  const row=document.createElement('div');row.className='batch-file';
  const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=exportSelected.has(path);check.className='export-check';check.onchange=()=>{if(check.checked)exportSelected.add(path);else exportSelected.delete(path);updateExportCount();};
  const names=document.createElement('span'),name=document.createElement('strong'),folder=document.createElement('small');name.textContent=path.split('/').pop();folder.textContent=path.slice(0,path.lastIndexOf('/'))||'/';names.append(name,folder);label.title=path;label.append(check,names);row.append(label);
  for(const [delta,symbol,title] of [[-1,'↑',t(lang,'moveUp')],[1,'↓',t(lang,'moveDown')]]){const b=document.createElement('button');b.textContent=symbol;b.setAttribute('aria-label',title+': '+name.textContent);b.disabled=index+delta<0||index+delta>=exportOrder.length;b.onclick=()=>{[exportOrder[index],exportOrder[index+delta]]=[exportOrder[index+delta],exportOrder[index]];renderExportList();const target=container.children[index+delta];target.querySelectorAll('button')[delta===-1?0:1].focus();};row.append(b);}
  container.append(row);
 });updateExportCount();
}
function updateExportCount(){const count=exportSelected.size;$('#batch-count').textContent=t(lang,'batchSelectedCount',count);$('#batch-separate').disabled=!count;$('#batch-merge').disabled=!count;}
function closeBatch(){const dialog=$('#batch-dialog');if(dialog.close)dialog.close();else dialog.removeAttribute('open');}
$('#batch-open').onclick=()=>{exportOrder=(library.openFiles||[]).map(f=>f.path);exportSelected=new Set(exportOrder);renderExportList();const dialog=$('#batch-dialog');if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');};
$('#batch-close').onclick=closeBatch;
$('#batch-select-all').onclick=()=>{exportSelected=new Set(exportSelected.size===exportOrder.length?[]:exportOrder);renderExportList();};
for(const [id,combined] of [['#batch-separate',false],['#batch-merge',true]])$(id).onclick=()=>{const paths=exportOrder.filter(path=>exportSelected.has(path));if(!paths.length)return;closeBatch();window.flushPosition();window.setExporting(true);if(!native('batchExport',{paths,combined})){window.setExporting(false);window.showError('PDF-Export ist in der Desktop-App verfügbar.');}};
function renderReadingDocument(content,path,base,side){
 const article=document.createElement('article');
 const markdown=/\.(md|markdown)$/i.test(path);
 if(markdown){article.innerHTML=DOMPurify.sanitize(md.render(content));enhanceMarkdown(article);}
 else {article.className='plain-text';const pre=document.createElement('pre');pre.className='plain-content';pre.textContent=content;article.append(pre);}
 article.querySelectorAll('img').forEach(img=>{const source=img.getAttribute('src');if(base&&source&&!/^[a-z][a-z0-9+.-]*:|^\/\//i.test(source))img.src=new URL(source,base).href;});
 article.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((heading,index)=>heading.id='dual-'+side+'-heading-'+index);
 article.querySelectorAll('a').forEach(link=>{if(link.getAttribute('href')?.startsWith('#'))link.onclick=event=>{event.preventDefault();let id;try{id=decodeURIComponent(link.hash.slice(1));}catch{return;}const target=[...article.querySelectorAll('h1,h2,h3,h4,h5,h6')].find(h=>h.textContent.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu,'').replace(/\s+/g,'-')===id);target?.scrollIntoView({behavior:'smooth',block:'start'});};});
 return article;
}
function initTooltips(){
 const tip=$('#ui-tooltip');
 if(!tip)return;
 let activeTarget=null,showTimer=null;
 const hide=()=>{clearTimeout(showTimer);activeTarget=null;tip.classList.remove('visible');tip.hidden=true;};
 const show=el=>{
  const raw=el.getAttribute('data-tooltip')||el.getAttribute('title');
  if(!raw)return;
  if(el.hasAttribute('title')){el.setAttribute('data-tooltip',raw);el.removeAttribute('title');}
  activeTarget=el;
  tip.replaceChildren();
  const match=raw.match(/^(.*?)\s*\(([^()]+)\)$/);
  if(match){
   tip.append(document.createTextNode(match[1]+' '));
   const kbd=document.createElement('kbd');kbd.textContent=match[2];tip.append(kbd);
  }else{
   tip.textContent=raw;
  }
  tip.hidden=false;
  const rect=el.getBoundingClientRect();
  const tipRect=tip.getBoundingClientRect();
  const vw=window.innerWidth||document.documentElement.clientWidth||1200;
  const vh=window.innerHeight||document.documentElement.clientHeight||800;
  let left=rect.left+rect.width/2-tipRect.width/2;
  left=Math.max(8,Math.min(vw-tipRect.width-8,left));
  let top=rect.bottom+8;
  if(top+tipRect.height>vh-8)top=Math.max(8,rect.top-tipRect.height-8);
  tip.style.left=Math.round(left)+'px';
  tip.style.top=Math.round(top)+'px';
  tip.classList.add('visible');
 };
 const schedule=el=>{clearTimeout(showTimer);showTimer=setTimeout(()=>show(el),140);};
 document.addEventListener('pointerover',e=>{const el=e.target?.closest?.('[title],[data-tooltip]');if(el&&el!==activeTarget)schedule(el);});
 document.addEventListener('pointerout',e=>{if(activeTarget&&!activeTarget.contains(e.relatedTarget))hide();});
 document.addEventListener('focusin',e=>{const el=e.target?.closest?.('[title],[data-tooltip]');if(el)schedule(el);});
 document.addEventListener('focusout',()=>hide());
 document.addEventListener('pointerdown',()=>hide());
 document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
}
function setLanguage(next){
 lang=next==='en'?'en':'de';
 try{localStorage.setItem('lang',lang);}catch{}
 applyLanguageToDOM(document,lang);
 if(!library.current){
  name=t(lang,'welcomeName');
  render(lang==='en'?sampleEn:sample,name);
 }else{
  const plain=name.toLowerCase().endsWith('.txt');
  $('#breadcrumb').textContent=t(lang,plain?'breadcrumbPlain':'breadcrumbPreview');
  const words=text.trim().split(/\s+/).filter(Boolean).length;
  $('#stats').textContent=t(lang,'wordsMinRead',words,Math.max(1,Math.ceil(words/220)));
  if($('#status').textContent==='Bereit'||$('#status').textContent==='Ready')$('#status').textContent=t(lang,'statusReady');
 }
 window.updateLibrary(library);
 window.refreshComparisonLanguage?.();
}
window.setLanguage=setLanguage;
window.getLanguage=()=>lang;
$('#lang-toggle').onclick=()=>setLanguage(lang==='de'?'en':'de');
let searchHits=[],searchIndex=-1,searchScope='current',globalSearchTimer=null,lastGlobalMatches=[],pendingSearchJump=null;
function clearSearchHighlights(){
 $('#document').querySelectorAll('mark.doc-search-hit').forEach(m=>m.replaceWith(document.createTextNode(m.textContent)));
 $('#document').normalize();
 searchHits=[];searchIndex=-1;
}
function updateSearchActive(scroll=true){
 searchHits.forEach((m,i)=>m.classList.toggle('active',i===searchIndex));
 $('#search-count').textContent=searchHits.length?`${searchIndex+1} / ${searchHits.length}`:($('#search-input').value?'0 / 0':'');
 if(scroll&&searchIndex>=0&&searchHits[searchIndex])searchHits[searchIndex].scrollIntoView?.({block:'center',behavior:'smooth'});
}
function runSearch(query){
 clearSearchHighlights();
 const q=query.trim().toLowerCase();
 if(!q){$('#search-count').textContent='';return;}
 const walker=document.createTreeWalker($('#document'),NodeFilter.SHOW_TEXT);
 const nodes=[];
 let n;while((n=walker.nextNode()))if(n.nodeValue&&n.nodeValue.toLowerCase().includes(q))nodes.push(n);
 for(const node of nodes){
  const val=node.nodeValue,lower=val.toLowerCase();
  const frag=document.createDocumentFragment();
  let pos=0,idx;
  while((idx=lower.indexOf(q,pos))!==-1){
   if(idx>pos)frag.append(document.createTextNode(val.slice(pos,idx)));
   const mark=document.createElement('mark');mark.className='doc-search-hit';mark.textContent=val.slice(idx,idx+q.length);
   frag.append(mark);searchHits.push(mark);
   pos=idx+q.length;
  }
  if(pos<val.length)frag.append(document.createTextNode(val.slice(pos)));
  node.replaceWith(frag);
 }
 searchIndex=searchHits.length?0:-1;
 updateSearchActive(true);
}
function filenameMatches(query){
 const q=query.trim().toLowerCase();
 if(!q)return[];
 const seen=new Set(),out=[];
 const add=(entries,badgeKey,isOpen)=>{
  for(const entry of entries||[]){
   const path=entry.path;if(!path||seen.has(path))continue;
   const fileName=path.split('/').pop()||path;
   if(fileName.toLowerCase().includes(q)){seen.add(path);out.push({path,name:fileName,badge:t(lang,badgeKey),isOpen});}
  }
 };
 add(library.openFiles,'searchBadgeOpen',true);
 add(library.bookmarks,'searchBadgeBookmark',false);
 add(library.history,'searchBadgeHistory',false);
 return out;
}
function renderGlobalSearchResults(){
 const container=$('#search-results');
 const query=$('#search-input').value.trim();
 if(searchScope!=='all'||!query){container.hidden=true;container.replaceChildren();$('#search-count').textContent='';return;}
 container.replaceChildren();container.hidden=false;
 const files=filenameMatches(query);
 const contentMatches=lastGlobalMatches||[];
 const total=files.length+contentMatches.length;
 $('#search-count').textContent=String(total);
 if(!total){const empty=document.createElement('div');empty.className='search-empty';empty.textContent=t(lang,'searchNoGlobalResults');container.append(empty);return;}
 if(files.length){
  const title=document.createElement('div');title.className='search-section-title';title.textContent=t(lang,'searchFilesSection');container.append(title);
  for(const f of files){
   const btn=document.createElement('button');btn.type='button';btn.className='search-result-item';
   const n=document.createElement('span');n.className='search-result-name';n.textContent=f.name;
   const b=document.createElement('span');b.className='search-result-meta';b.textContent=f.badge;
   const s=document.createElement('span');s.className='search-result-snippet';s.textContent=f.path;
   btn.append(n,b,s);
   btn.onclick=()=>{window.flushPosition();closeSearch();native(f.isOpen?'openDocument':'openRecent',{path:f.path});};
   container.append(btn);
  }
 }
 if(contentMatches.length){
  const title=document.createElement('div');title.className='search-section-title';title.textContent=t(lang,'searchContentSection');container.append(title);
  for(const m of contentMatches){
   const btn=document.createElement('button');btn.type='button';btn.className='search-result-item';
   const n=document.createElement('span');n.className='search-result-name';n.textContent=m.name;
   const b=document.createElement('span');b.className='search-result-meta';b.textContent=t(lang,'searchLine',m.line);
   const s=document.createElement('span');s.className='search-result-snippet';s.textContent=m.snippet;
   btn.append(n,b,s);
   btn.onclick=()=>{
    if(m.path===documentPath){setSearchScope('current');runSearch(query);return;}
    pendingSearchJump={path:m.path,query};
    window.flushPosition();
    native('openDocument',{path:m.path});
   };
   container.append(btn);
  }
 }
}
window.showGlobalSearchResults=results=>{
 lastGlobalMatches=Array.isArray(results)?results:[];
 renderGlobalSearchResults();
};
function triggerSearch(){
 const q=$('#search-input').value;
 if(searchScope==='current'){
  $('#search-results').hidden=true;
  runSearch(q);
 }else{
  clearSearchHighlights();
  renderGlobalSearchResults();
  clearTimeout(globalSearchTimer);
  const trimmed=q.trim();
  if(!trimmed){lastGlobalMatches=[];renderGlobalSearchResults();return;}
  globalSearchTimer=setTimeout(()=>{if(!native('searchOpenDocuments',{query:trimmed})){lastGlobalMatches=[];renderGlobalSearchResults();}},90);
 }
}
function setSearchScope(scope){
 searchScope=scope==='all'?'all':'current';
 document.querySelectorAll('#search-scope button').forEach(b=>b.classList.toggle('active',b.dataset.scope===searchScope));
 $('#search-prev').hidden=$('#search-next').hidden=searchScope==='all';
 $('#search-input').placeholder=t(lang,searchScope==='all'?'searchAllPlaceholder':'searchPlaceholder');
 triggerSearch();
}
function openSearch(scope='current'){
 $('#search-bar').hidden=false;
 setSearchScope(scope);
 const inp=$('#search-input');inp.focus();inp.select();
}
function closeSearch(){
 $('#search-bar').hidden=true;
 $('#search-results').hidden=true;
 $('#search-results').replaceChildren();
 clearTimeout(globalSearchTimer);
 clearSearchHighlights();
 $('#search-count').textContent='';
}
function initSearch(){
 $('#find-open').onclick=()=>openSearch('current');
 $('#search-close').onclick=closeSearch;
 document.querySelectorAll('#search-scope button').forEach(b=>b.onclick=()=>{setSearchScope(b.dataset.scope);$('#search-input').focus();});
 $('#search-input').oninput=triggerSearch;
 $('#search-prev').onclick=()=>{if(!searchHits.length)return;searchIndex=(searchIndex-1+searchHits.length)%searchHits.length;updateSearchActive(true);};
 $('#search-next').onclick=()=>{if(!searchHits.length)return;searchIndex=(searchIndex+1)%searchHits.length;updateSearchActive(true);};
 $('#search-input').onkeydown=e=>{
  if(e.key==='Enter'&&searchScope==='current'){e.preventDefault();if(!searchHits.length)return;searchIndex=(searchIndex+(e.shiftKey?-1:1)+searchHits.length)%searchHits.length;updateSearchActive(true);}
  else if(e.key==='Escape'){e.stopPropagation();closeSearch();}
 };
 document.addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='f'&&!document.body.classList.contains('comparing')){e.preventDefault();openSearch(e.shiftKey?'all':'current');}
 });
}
initComparison({native,renderReadingDocument,flushPosition:()=>window.flushPosition()});
initTooltips();
initSearch();
applyLanguageToDOM(document,lang);
window.updateLibrary(library);
render(lang==='en'?sampleEn:sample,t(lang,'welcomeName'));native('ready');

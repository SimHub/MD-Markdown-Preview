import {buildTextComparison,textBlocks,clearTextMarks,markTextBlocks} from './text-comparison.js';
import {getLang,t} from './i18n.js';
import {structuredPatch} from 'diff';

export function buildComparison(oldText,newText){
 const lang=getLang();
 const patch=structuredPatch(t(lang,'cmpDiffBefore'),t(lang,'cmpDiffAfter'),oldText,newText,'','',{context:3,timeout:1200,maxEditLength:5000});
 if(!patch)throw new Error(t(lang,'cmpPatchFail'));
 if(patch.hunks.reduce((n,h)=>n+h.lines.length,0)>12000)throw new Error(t(lang,'cmpTooManyLines'));
 return patch;
}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function rowsFor(hunk){
 let old=hunk.oldStart,neu=hunk.newStart;
 return hunk.lines.map(line=>{const type=line[0],text=line.slice(1);return {type,text,old:type===' '||type==='-'?old++:null,neu:type===' '||type==='+'?neu++:null};});
}
export function initComparison({native,flushPosition,renderReadingDocument}){
 const $=s=>document.querySelector(s);
 let payload=null,patch=null,notes={comments:{},reviewed:[]},saveTimer,dirty=false,selectedHunk=0;
 const content=$('#comparison-content');
 const reviewFooter=$('#comparison-footer').textContent;
 let readingPositions={left:0,right:0},selectedFiles={},textResult=null,textGroups=null,textIndex=-1,relationFlashTimer;
 let pendingSession=null,restoringSession=false,sessionError=false,sessionEnabled=true,sessionTimer,lastMode=$('#compare-view').value,restoreEpoch=0,userMoved=false,sessionHasWorkspace=false;
 function snapshotSession(modeOverride){
  if(!sessionHasWorkspace||restoringSession||sessionError||!sessionEnabled)return null;
  captureReading();const files=payload||selectedFiles;
  return {left:files.left||'',right:files.right||'',mode:typeof modeOverride==='string'?modeOverride:lastMode,textLevel:$('#text-compare-level').value,leftScroll:readingPositions.left,rightScroll:readingPositions.right,diffScroll:content.scrollTop,selectedHunk:Math.max(0,selectedHunk),textIndex,visible:!$('#comparison').hidden};
 }
 window.flushComparisonSession=modeOverride=>{clearTimeout(sessionTimer);const session=snapshotSession(modeOverride);if(session)native('saveComparisonSession',{session});return session;};
 function scheduleSession(){if(restoringSession||sessionError||!sessionEnabled||$('#comparison').hidden)return;clearTimeout(sessionTimer);sessionTimer=setTimeout(()=>window.flushComparisonSession(),250);}
 function finishSessionRender(){
  if(pendingSession){
   const session=pendingSession,epoch=restoreEpoch;
   function restoreScroll(){for(const side of ['left','right']){const pane=$('#dual-scroll-'+side);if(pane)pane.scrollTop=side==='left'?session.leftScroll:session.rightScroll;}content.scrollTop=session.diffScroll;}
   restoreScroll();selectedHunk=Math.max(0,Math.min(session.selectedHunk,(patch?.hunks.length||1)-1));textIndex=Math.max(-1,Math.min(session.textIndex,(textResult?.changes.length||0)-1));
   content.querySelectorAll('img').forEach(image=>{if(!image.complete)image.addEventListener('load',()=>{if(epoch===restoreEpoch&&!userMoved)restoreScroll();},{once:true});});
   pendingSession=null;restoringSession=false;sessionError=false;$('#text-compare-message').title=t(getLang(),'cmpSessionRestored');
  }
  scheduleSession();
 }
 window.prepareComparisonSession=session=>{clearTimeout(sessionTimer);pendingSession=session;restoringSession=true;sessionEnabled=true;sessionError=false;restoreEpoch++;userMoved=false;payload=null;patch=null;textResult=null;textGroups=null;selectedFiles={left:session.left,right:session.right};readingPositions={left:session.leftScroll,right:session.rightScroll};lastMode=session.mode;$('#compare-view').value=session.mode;$('#text-compare-level').value=session.textLevel;window.openComparison();content.replaceChildren(element('div','compare-empty',t(getLang(),'cmpSessionRestoring')));modeUI();};
 window.resetComparisonSession=()=>{clearTimeout(sessionTimer);pendingSession=null;restoringSession=false;sessionError=false;sessionEnabled=false;restoreEpoch++;payload=null;patch=null;textResult=null;textGroups=null;notes={comments:{},reviewed:[]};dirty=false;selectedFiles={left:'',right:''};readingPositions={left:0,right:0};selectedHunk=0;textIndex=-1;content.replaceChildren();paths(selectedFiles);$('#text-compare-message').textContent=t(getLang(),'cmpSessionCleared');};
 content.addEventListener('scroll',()=>scheduleSession(),true);
 for(const event of ['wheel','pointerdown','keydown'])content.addEventListener(event,()=>{userMoved=true;},{passive:true});
 $('#session-clear').onclick=()=>{window.flushReview();clearTimeout(sessionTimer);sessionEnabled=false;native('clearComparisonSession',{area:reading()?'reading':'diff'});};
 const complete=()=>!!(payload?.left&&payload?.right);
 const reading=()=>$('#compare-view').value.startsWith('documents-');
 function captureReading(){for(const side of ['left','right']){const scroll=$('#dual-scroll-'+side);if(scroll)readingPositions[side]=scroll.scrollTop;}}
 function modeUI(){const lang=getLang(),isReading=reading();$('#comparison').classList.toggle('reading-mode',isReading);$('#text-compare-controls').hidden=!isReading;$('#text-compare-level').disabled=!complete();$('#text-compare-run').disabled=!complete();$('#text-compare-message').hidden=!isReading||!complete();$('#comparison').classList.toggle('partial-mode',!!payload&&!complete());$('#comparison-title').textContent=t(lang,isReading?'cmpReadingTitle':'compareTitle');$('#compare-reload').textContent=t(lang,isReading?'cmpReadingReload':'compareReload');$('#comparison-footer').textContent=t(lang,isReading?'cmpReadingFooter':'compareFooter');$('#dual-open').setAttribute('aria-pressed',String(isReading&&!$('#comparison').hidden));$('#compare-open').setAttribute('aria-pressed',String(!isReading&&!$('#comparison').hidden));}
 function highlightText(){
  const lang=getLang();
  textResult=null;textGroups=null;textIndex=-1;$('#comparison').classList.remove('text-comparing');modeUI();if(reading()&&complete()){$('#compare-summary').textContent=t(lang,'cmpReadingSummary');$('#compare-prev').disabled=$('#compare-next').disabled=true;}
  const left=$('#dual-scroll-left article'),right=$('#dual-scroll-right article');
  if(left)clearTextMarks(left);if(right)clearTextMarks(right);
  if(!reading()||!complete()||!left||!right)return;
  const message=$('#text-compare-message');message.classList.remove('comparison-problem');
  if($('#text-compare-level').value==='off'){message.textContent=t(lang,'cmpTextOff');return;}
  try{
   const groups={left:textBlocks(left),right:textBlocks(right)};
   if(!groups.left.length&&!groups.right.length)throw new Error(t(lang,'cmpNoTextFound'));
   const result=buildTextComparison(groups.left.map(b=>b.text),groups.right.map(b=>b.text),$('#text-compare-level').value);
   const relations={left:groups.left.map(()=>[]),right:groups.right.map(()=>[])};
   const names={equal:t(lang,'cmpRelEqual'),similar:t(lang,'cmpRelSimilar'),different:t(lang,'cmpRelDifferent'),only:t(lang,'cmpRelOnly')};
   result.matches.forEach((match,index)=>{for(const side of ['left','right']){const block=match[side];if(block!==null)relations[side][block].push({start:0,end:groups[side][block].text.length,id:index,kind:match.kind,label:`${names[match.kind]} · ${index+1}`});}});
   markTextBlocks(groups.left,relations.left,'left',true);markTextBlocks(groups.right,relations.right,'right',true);
   const markedGroups={left:textBlocks(left),right:textBlocks(right)};
   markTextBlocks(markedGroups.left,result.left,'left');markTextBlocks(markedGroups.right,result.right,'right');textResult=result;textGroups=markedGroups;
   for(const side of ['left','right'])for(const badge of $('#dual-scroll-'+side).querySelectorAll('mark[data-text-relation][data-label]')){
    const match=result.matches[Number(badge.dataset.textRelation)],other=side==='left'?'right':'left',available=match?.[other]!==null;
    badge.tabIndex=0;badge.setAttribute('role','button');badge.setAttribute('aria-label',badge.dataset.label+t(lang,'cmpJumpAria',available));
    badge.title=t(lang,available?'cmpJumpTitle':'cmpNoCounterpartTitle');
   }
   $('#comparison').classList.add('text-comparing');$('#compare-prev').disabled=$('#compare-next').disabled=!result.changes.length;
   const counts={equal:0,similar:0,different:0,only:0};result.matches.forEach(match=>counts[match.kind]++);
   const levelText=$('#text-compare-level').selectedOptions[0]?.textContent||$('#text-compare-level').value;
   message.textContent=t(lang,'cmpTextMsgDone',levelText,counts.equal,counts.similar,counts.different,counts.only);
   $('#compare-summary').textContent=t(lang,'cmpTextSummary',counts.equal,counts.similar,counts.different,counts.only)+` · ${result.changes.length}`;
  }catch(error){message.textContent=error.message;message.classList.add('comparison-problem');$('#compare-summary').textContent=error.message;}
 }
 function jumpToRelation(badge){
  if(!textResult||!reading())return;
  const side=badge.closest('.dual-pane')?.dataset.comparisonSide,other=side==='left'?'right':'left',id=Number(badge.dataset.textRelation),match=textResult.matches[id];
  if(!side||!match)return;
  clearTimeout(relationFlashTimer);content.querySelectorAll('.text-relation-active').forEach(node=>node.classList.remove('text-relation-active'));
  const selector=`mark[data-text-relation="${id}"]`,sourceScroll=$('#dual-scroll-'+side),targetScroll=$('#dual-scroll-'+other);
  sourceScroll.querySelectorAll(selector).forEach(mark=>mark.classList.add('text-relation-active'));
  const target=targetScroll?.querySelector(selector+'[data-label]')||targetScroll?.querySelector(selector);
  const message=$('#text-compare-message');message.classList.remove('comparison-problem');
  if(match[other]===null||!target){message.textContent=`${badge.dataset.label||'Stelle '+(id+1)}: In der anderen Datei gibt es keine zugeordnete Gegenstelle.`;}
  else {
   targetScroll.querySelectorAll(selector).forEach(mark=>mark.classList.add('text-relation-active'));
   const source=sourceScroll.querySelector(selector+'[data-label]')||badge;
   const offset=source.getBoundingClientRect().top-sourceScroll.getBoundingClientRect().top;
   const top=targetScroll.scrollTop+target.getBoundingClientRect().top-targetScroll.getBoundingClientRect().top-offset;
   const maximum=Math.max(0,targetScroll.scrollHeight-targetScroll.clientHeight);
   targetScroll.scrollTo({top:Math.max(0,Math.min(maximum,top)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
   message.textContent=`${source.dataset.label||'Stelle '+(id+1)}: Gegenstelle in der anderen Datei angezeigt.`;
  }
  relationFlashTimer=setTimeout(()=>content.querySelectorAll('.text-relation-active').forEach(node=>node.classList.remove('text-relation-active')),1800);
 }
 content.addEventListener('click',event=>{const badge=event.target.closest('mark[data-text-relation]');if(!badge||event.target.closest('a')||window.getSelection()?.toString())return;jumpToRelation(badge);});
 content.addEventListener('keydown',event=>{if(event.key!=='Enter'&&event.key!==' ')return;const badge=event.target.closest('mark[data-text-relation][data-label]');if(!badge)return;event.preventDefault();jumpToRelation(badge);});
 function navigateText(delta){
  if(!textResult?.changes.length)return;
  textIndex=textIndex<0?(delta>0?0:textResult.changes.length-1):(textIndex+delta+textResult.changes.length)%textResult.changes.length;
  document.querySelectorAll('.text-change-active').forEach(mark=>mark.classList.remove('text-change-active'));
  const change=textResult.changes[textIndex];
  for(const side of ['left','right']){const article=$('#dual-scroll-'+side+' article');if(!article)continue;const marks=[...article.querySelectorAll(`mark[data-text-change="${textIndex}"]`)];marks.forEach(mark=>mark.classList.add('text-change-active'));const target=marks[0]||(change[side]!==null?textGroups[side][change[side]]?.element:null);target?.scrollIntoView({behavior:'smooth',block:'center'});}
  $('#compare-summary').textContent=`Textunterschied ${textIndex+1} von ${textResult.changes.length} · Rot = links/oben · Grün = rechts/unten`;
 }
 $('#text-compare-level').onchange=()=>{highlightText();sessionEnabled=true;scheduleSession();};
 $('#text-compare-run').onclick=()=>{sessionEnabled=true;if($('#text-compare-level').value==='off')$('#text-compare-level').value='words';highlightText();scheduleSession();};
 function updateCount(){
  if(!patch)return;
  const added=patch.hunks.reduce((n,h)=>n+h.lines.filter(l=>l.startsWith('+')).length,0),removed=patch.hunks.reduce((n,h)=>n+h.lines.filter(l=>l.startsWith('-')).length,0);
  const count=patch.hunks.filter((_,i)=>notes.reviewed.includes('h'+i)).length;
  $('#compare-summary').textContent=patch.hunks.length?`${patch.hunks.length} ${patch.hunks.length===1?'Änderungsblock':'Änderungsblöcke'} · +${added} / −${removed} Zeilen · ${count} geprüft`:'Die Dateien sind identisch.';
  $('#compare-prev').disabled=$('#compare-next').disabled=!patch.hunks.length;
  $('#review-clear').disabled=!Object.keys(notes.comments).length&&!notes.reviewed.length;
 }
 window.flushReview=()=>{
  clearTimeout(saveTimer);
  if(!payload?.key)return null;
  const snapshot={key:payload.key,notes:JSON.parse(JSON.stringify(notes))};
  if(dirty){native('saveReview',snapshot);dirty=false;}
  return snapshot;
 };
 function save(){dirty=true;$('#review-status').textContent='Wird gespeichert …';clearTimeout(saveTimer);saveTimer=setTimeout(window.flushReview,250);updateCount();}
 window.reviewSaved=(saved,key)=>{if(key&&key!==payload?.key)return;if(!saved)dirty=true;$('#review-status').textContent=saved?'Lokal gespeichert':'Speichern fehlgeschlagen · Notizen zu umfangreich';};
 function diffTable(hunk){
  const split=$('#compare-view').value==='split', table=element('table','diff-table '+(split?'diff-split':'diff-unified')),body=element('tbody');
  const rows=rowsFor(hunk);
  function num(value,side){const td=element('td','diff-number',value===null?'':String(value));if(side)td.dataset.comparisonSide=side;return td;}
  function code(row,side){const td=element('td','diff-code '+(row?.type==='+'?'added':row?.type==='-'?'removed':''));if(side)td.dataset.comparisonSide=side;td.append(element('pre','',row?row.text:''));return td;}
  if(!split){for(const row of rows){const tr=element('tr',row.type==='+'?'added':row.type==='-'?'removed':row.type==='\\'?'diff-meta':'');tr.append(num(row.old),num(row.neu),element('td','diff-sign',row.type==='\\'?'':row.type),code(row));body.append(tr);}}
  else {
   for(let i=0;i<rows.length;){const row=rows[i];if(row.type===' '){const tr=element('tr');tr.append(num(row.old,'left'),code(row,'left'),num(row.neu,'right'),code(row,'right'));body.append(tr);i++;}
    else if(row.type==='\\'){const tr=element('tr','diff-meta'),td=element('td','',row.text);td.colSpan=4;tr.append(td);body.append(tr);i++;}
    else {const deleted=[],added=[];while(i<rows.length&&rows[i].type!==' '){const r=rows[i++];if(r.type==='-')deleted.push(r);if(r.type==='+')added.push(r);if(r.type==='\\'){const list=rows[i-2]?.type==='-'?deleted:added;if(list.length)list.at(-1).text+='  [Kein Zeilenumbruch am Dateiende]';}}
     for(let j=0;j<Math.max(deleted.length,added.length);j++){const tr=element('tr');tr.append(num(deleted[j]?.old??null,'left'),code(deleted[j],'left'),num(added[j]?.neu??null,'right'),code(added[j],'right'));body.append(tr);}
    }
   }
  }
  table.append(body);return table;
 }
 function render(){
  captureReading();textResult=null;textGroups=null;$('#comparison').classList.remove('text-comparing');modeUI();content.replaceChildren();
  if(reading()||(payload&&!complete())){
   $('#compare-prev').disabled=$('#compare-next').disabled=$('#review-clear').disabled=true;
   if(!payload){content.append(element('div','compare-empty','Zwei Dateien auswählen, um sie gleichzeitig zu lesen.'));return;}
   const grid=element('div','dual-grid'+($('#compare-view').value==='documents-stacked'?' stacked':''));
   for(const [side,text,path,base] of [['left',payload.old,payload.left,payload.leftBase],['right',payload.new,payload.right,payload.rightBase]]){
    const pane=element('section','dual-pane');pane.dataset.comparisonSide=side;pane.setAttribute('aria-label',path?path.split('/').pop():(side==='left'?'Erste Datei':'Zweite Datei'));
    const scroll=element('div','dual-scroll');scroll.id='dual-scroll-'+side;scroll.tabIndex=0;scroll.setAttribute('aria-label','Dokument: '+path.split('/').pop());if(path&&typeof text==='string')scroll.append(renderReadingDocument(text,reading()?path:path+'.txt',base,side));else {const empty=element('div','file-drop-slot');empty.append(element('strong','',side==='left'?'Erste Datei':'Zweite Datei'),element('p','','Datei hier hineinziehen oder einzeln auswählen.'));const choose=element('button','', 'Datei auswählen …');choose.onclick=()=>{window.flushReview();native('pickComparison',{side});};empty.append(choose);scroll.append(empty);}pane.append(scroll);grid.append(pane);
   }
   content.append(grid);for(const side of ['left','right'])$('#dual-scroll-'+side).scrollTop=readingPositions[side];
   $('#compare-summary').textContent=complete()?'Zwei vollständige Dateien · unabhängig scrollbar':payload.left?'Erste Datei geladen · zweite Datei auswählen oder hineinziehen':payload.right?'Zweite Datei geladen · erste Datei auswählen oder hineinziehen':'Eine oder zwei Dateien auswählen oder hineinziehen';highlightText();finishSessionRender();return;
  }
  if(!patch)return;
  const lang=getLang();
  if(!patch.hunks.length){content.append(element('div','compare-empty',t(lang,'cmpNoChanges')));updateCount();finishSessionRender();return;}
  patch.hunks.forEach((hunk,index)=>{
   const rangeText=(start,count)=>count===0?t(lang,'cmpNoLines'):count===1?String(start):`${start}–${start+count-1}`;
   const id='h'+index,section=element('section','diff-hunk');section.id='diff-hunk-'+index;
   const header=element('div','diff-hunk-header'),range=element('strong','',`#${index+1} · ${t(lang,'cmpDiffBefore')} ${rangeText(hunk.oldStart,hunk.oldLines)} / ${t(lang,'cmpDiffAfter')} ${rangeText(hunk.newStart,hunk.newLines)}`);
   const label=element('label'),checkbox=element('input');checkbox.type='checkbox';checkbox.checked=notes.reviewed.includes(id);checkbox.onchange=()=>{notes.reviewed=notes.reviewed.filter(x=>x!==id);if(checkbox.checked)notes.reviewed.push(id);section.classList.toggle('reviewed',checkbox.checked);save();};label.append(checkbox,document.createTextNode(' '+t(lang,'cmpReviewed')));header.append(range,label);section.append(header);
   section.classList.toggle('reviewed',checkbox.checked);const scroller=element('div','diff-scroll');scroller.append(diffTable(hunk));section.append(scroller);
   const commentLabel=element('label','review-comment-label',t(lang,'cmpReviewNoteLabel',index+1)),textarea=element('textarea','review-comment');textarea.rows=2;textarea.maxLength=20000;textarea.placeholder=t(lang,'cmpReviewPlaceholder');textarea.value=notes.comments[id]||'';textarea.setAttribute('aria-label',commentLabel.textContent);textarea.oninput=()=>{if(textarea.value)notes.comments[id]=textarea.value;else delete notes.comments[id];save();};commentLabel.append(textarea);section.append(commentLabel);content.append(section);
  });updateCount();finishSessionRender();
 }
 function paths(files){
  selectedFiles=files;const lang=getLang();
  for(const side of ['left','right']){
   const label=reading()?($('#compare-view').value==='documents-stacked'?(side==='left'?t(lang,'cmpReadingTop'):t(lang,'cmpReadingBottom')):(side==='left'?t(lang,'cmpReadingLeft'):t(lang,'cmpReadingRight'))):(side==='left'?t(lang,'cmpDiffBefore'):t(lang,'cmpDiffAfter'));
   const button=$('#compare-'+side);button.textContent=files[side]?label+': '+files[side].split('/').pop():t(lang,'cmpSelectSide',label);
   button.title=t(lang,'cmpDropHint',files[side]);$('#compare-clear-'+side).disabled=!files[side];
  }
  $('#compare-reload').disabled=$('#compare-swap').disabled=!(files.left||files.right);
 }
 window.refreshComparisonLanguage=()=>{modeUI();paths(payload||selectedFiles);if(payload&&!$('#comparison').hidden)render();else if(!payload)$('#compare-summary').textContent=t(getLang(),'compareSummaryDefault');};
 window.setComparisonFiles=files=>{if(pendingSession&&(files.left!==pendingSession.left||files.right!==pendingSession.right)){pendingSession=null;restoringSession=false;sessionError=false;readingPositions={left:0,right:0};restoreEpoch++;}captureReading();if(payload&&(files.left!==payload.left||files.right!==payload.right)){window.flushReview();if(files.left!==payload.left)readingPositions.left=0;if(files.right!==payload.right)readingPositions.right=0;payload=null;patch=null;textResult=null;textGroups=null;$('#comparison').classList.remove('text-comparing');content.replaceChildren(element('div','compare-empty','Dateien werden eingelesen …'));$('#compare-summary').textContent='Neue Dateiauswahl';$('#review-status').textContent='';$('#compare-prev').disabled=$('#compare-next').disabled=$('#review-clear').disabled=true;}paths(files);};
 window.openComparison=()=>{sessionHasWorkspace=true;document.body.classList.remove('focus');document.body.classList.add('comparing');flushPosition();$('#comparison').hidden=false;$('#compare-open').setAttribute('aria-pressed','true');};
 window.comparisonError=message=>{sessionError=true;textResult=null;textGroups=null;$('#comparison').classList.remove('text-comparing');window.flushReview();patch=null;content.replaceChildren(element('div','compare-empty','Kein aktueller Vergleich. Bitte beide Dateien erneut einlesen.'));$('#compare-summary').textContent=message;$('#compare-prev').disabled=$('#compare-next').disabled=$('#review-clear').disabled=true;};
 window.showComparison=data=>{
  if(!pendingSession)restoreEpoch++;sessionError=false;sessionEnabled=true;
  window.flushReview();captureReading();const previous=payload||selectedFiles;if(previous.left!==data.left)readingPositions.left=0;if(previous.right!==data.right)readingPositions.right=0;payload=data;patch=null;dirty=false;notes={comments:{...(data.notes?.comments||{})},reviewed:[...(data.notes?.reviewed||[])]};selectedHunk=0;
  window.openComparison();paths(data);content.replaceChildren();$('#review-status').textContent=Object.keys(notes.comments).length||notes.reviewed.length?'Review wiederhergestellt':'';
  try{if(!reading()&&complete())patch=buildComparison(data.old,data.new);render();}catch(error){content.append(element('div','compare-empty',error.message));$('#compare-summary').textContent='Vergleich begrenzt';$('#compare-prev').disabled=$('#compare-next').disabled=true;}
 };
 window.showPartialComparison=data=>{if(!pendingSession)restoreEpoch++;sessionError=false;if(data.left||data.right)sessionEnabled=true;window.flushReview();captureReading();const previous=payload||selectedFiles;if(previous.left!==data.left)readingPositions.left=0;if(previous.right!==data.right)readingPositions.right=0;payload=data;patch=null;notes={comments:{},reviewed:[]};dirty=false;$('#review-status').textContent='';window.openComparison();paths(data);content.replaceChildren();render();};
 window.comparisonDropSide=(x,y)=>document.elementFromPoint(x,y)?.closest('[data-comparison-side]')?.dataset.comparisonSide||null;
 for(const side of ['left','right'])$('#compare-clear-'+side).onclick=()=>{window.flushReview();window.flushComparisonSession();native('clearComparison',{side});};
 $('#compare-open').onclick=()=>{flushPosition();native('openComparison');};
 $('#compare-close').onclick=()=>{window.flushReview();native('closeComparison');$('#dual-open').setAttribute('aria-pressed','false');$('#comparison').hidden=true;document.body.classList.remove('comparing');$('#compare-open').setAttribute('aria-pressed','false');$('#open').focus();window.flushComparisonSession();};
 $('#compare-pick').onclick=()=>{window.flushReview();window.flushComparisonSession();native('pickComparison');};
 for(const side of ['left','right'])$('#compare-'+side).onclick=()=>{window.flushReview();window.flushComparisonSession();native('pickComparison',{side});};
 $('#compare-reload').onclick=()=>{window.flushReview();native('compareFiles');};$('#compare-swap').onclick=()=>{window.flushReview();window.flushComparisonSession();native('swapComparison');};
 window.setComparisonMode=mode=>{if(!['unified','split','documents-side','documents-stacked'].includes(mode))return;if(mode!==lastMode&&!restoringSession)window.flushComparisonSession(lastMode);captureReading();lastMode=mode;sessionEnabled=true;$('#compare-view').value=mode;try{if(!reading()&&complete()&&!patch)patch=buildComparison(payload.old,payload.new);render();paths(payload||selectedFiles);}catch(error){window.comparisonError(error.message);}};
 $('#compare-view').onchange=()=>window.setComparisonMode($('#compare-view').value);
 window.openDualReading=()=>{window.openComparison();window.setComparisonMode('documents-side');};
 $('#dual-open').onclick=()=>{flushPosition();native('openDualReading');};
 $('#review-clear').onclick=()=>{notes={comments:{},reviewed:[]};save();window.flushReview();render();};
 for(const [selector,delta] of [['#compare-next',1],['#compare-prev',-1]])$(selector).onclick=()=>{if(reading()){navigateText(delta);return;}if(!patch?.hunks.length)return;selectedHunk=(selectedHunk+delta+patch.hunks.length)%patch.hunks.length;$('#diff-hunk-'+selectedHunk)?.scrollIntoView({behavior:'smooth',block:'start'});};
 document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.shiftKey&&(event.code==='Digit2'||event.key==='2'||event.key==='@'||event.key==='"')){event.preventDefault();$('#dual-open').click();}if((event.metaKey||event.ctrlKey)&&event.shiftKey&&event.key.toLowerCase()==='d'){event.preventDefault();$('#compare-open').click();}if(event.key==='Escape'&&!$('#comparison').hidden)$('#compare-close').click();});
 $('#comparison').addEventListener('drop',event=>{event.preventDefault();event.stopPropagation();});
 window.addEventListener('pagehide',()=>{window.flushReview();window.flushComparisonSession();});paths({});$('#compare-prev').disabled=$('#compare-next').disabled=$('#review-clear').disabled=true;
}

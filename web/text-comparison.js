import {diffChars,diffWordsWithSpace,diffSentences} from 'diff';

const normalize=text=>text.replace(/\s+/g,' ').trim();
function terms(text){return new Set((text.slice(0,6000).toLocaleLowerCase().match(/[\p{L}\p{N}_]+/gu)||[]).slice(0,500));}
function similarity(a,b){if(a===b)return 1;const x=terms(a),y=terms(b);if(!x.size||!y.size)return 0;let shared=0;for(const word of x)if(y.has(word))shared++;return 2*shared/(x.size+y.size);}
function alignChanged(left,right,leftStart,rightStart){
 if(!left.length)return right.map((_,i)=>[null,rightStart+i]);
 if(!right.length)return left.map((_,i)=>[leftStart+i,null]);
 if(left.length===1&&right.length===1)return [[leftStart,rightStart]];
 if(left.length*right.length>10000){const result=[];for(let i=0;i<Math.max(left.length,right.length);i++){if(i<left.length&&i<right.length&&similarity(left[i],right[i])>=0.3)result.push([leftStart+i,rightStart+i]);else{if(i<left.length)result.push([leftStart+i,null]);if(i<right.length)result.push([null,rightStart+i]);}}return result;}
 const cachedLeft=left.map(terms),cachedRight=right.map(terms);
 function scoreFor(i,j){if(left[i]===right[j])return 1;const a=cachedLeft[i],b=cachedRight[j];if(!a.size||!b.size)return 0;let common=0;for(const term of a)if(b.has(term))common++;return 2*common/(a.size+b.size);}
 const width=right.length+1,cost=new Float64Array((left.length+1)*width),directions=new Uint8Array(cost.length);
 for(let i=1;i<=left.length;i++){cost[i*width]=i*.7;directions[i*width]=1;}
 for(let j=1;j<=right.length;j++){cost[j]=j*.7;directions[j]=2;}
 for(let i=1;i<=left.length;i++)for(let j=1;j<=right.length;j++){
  const score=scoreFor(i-1,j-1),match=cost[(i-1)*width+j-1]+(score>=.3?1-score:1.3),remove=cost[(i-1)*width+j]+.7,add=cost[i*width+j-1]+.7,index=i*width+j;
  if(match<=remove&&match<=add){cost[index]=match;directions[index]=3;}else if(remove<=add){cost[index]=remove;directions[index]=1;}else{cost[index]=add;directions[index]=2;}
 }
 const pairs=[];let i=left.length,j=right.length;while(i||j){const direction=directions[i*width+j];if(direction===3){pairs.push([leftStart+--i,rightStart+--j]);}else if(direction===1)pairs.push([leftStart+--i,null]);else pairs.push([null,rightStart+--j]);}
 return pairs.reverse();
}
// Unique unchanged paragraphs form ordered anchors. Large unmatched book tails are linear,
// rather than consuming the edit-distance budget of a whole-document Myers diff.
function paragraphPairs(a,b){
 function occurrences(values){const map=new Map();values.forEach((text,index)=>{const item=map.get(text);if(item)item.count++;else map.set(text,{index,count:1});});return map;}
 const old=occurrences(a),neu=occurrences(b),candidates=[];
 for(let index=0;index<a.length;index++){const item=neu.get(a[index]);if(old.get(a[index]).count===1&&item?.count===1)candidates.push([index,item.index]);}
 const tails=[],positions=[],previous=new Int32Array(candidates.length).fill(-1);
 candidates.forEach((pair,index)=>{let low=0,high=tails.length;while(low<high){const mid=(low+high)>>1;if(tails[mid]<pair[1])low=mid+1;else high=mid;}tails[low]=pair[1];previous[index]=low?positions[low-1]:-1;positions[low]=index;});
 const anchors=[];let cursor=positions.at(-1);while(cursor!==undefined&&cursor>=0){anchors.push(candidates[cursor]);cursor=previous[cursor];}anchors.reverse();anchors.push([a.length,b.length]);
 const result=[];let x=0,y=0;
 for(const [left,right] of anchors){result.push(...alignChanged(a.slice(x,left),b.slice(y,right),x,y));if(left<a.length&&right<b.length)result.push([left,right]);x=left+1;y=right+1;}
 return result;
}
export function buildTextComparison(left,right,level='words'){
 if(left.length+right.length>40000||left.reduce((n,x)=>n+x.length,0)+right.reduce((n,x)=>n+x.length,0)>4000000)throw new Error('Textvergleich auf insgesamt 40.000 Textblöcke und 4 Millionen Zeichen begrenzt.');
 const a=left.map(normalize),b=right.map(normalize),pairs=paragraphPairs(a,b);
 const result={left:left.map(()=>[]),right:right.map(()=>[]),changes:[],coarseBlocks:0,matches:pairs.map(([l,r])=>({left:l,right:r,kind:l===null||r===null?'only':a[l]===b[r]?'equal':similarity(a[l],b[r])>=.3?'similar':'different'}))};const started=Date.now();
 for(const [l,r] of pairs){
  const old=l===null?'':left[l],neu=r===null?'':right[r];if(old===neu||(l!==null&&r!==null&&a[l]===b[r]))continue;
  if(level==='paragraphs'||l===null||r===null||Date.now()-started>1800){if(level!=='paragraphs'&&l!==null&&r!==null)result.coarseBlocks++;const id=result.changes.length;result.changes.push({left:l,right:r});if(l!==null&&old)result.left[l].push({start:0,end:old.length,id});if(r!==null&&neu)result.right[r].push({start:0,end:neu.length,id});continue;}
  const calculate=level==='chars'?diffChars:level==='sentences'?diffSentences:diffWordsWithSpace;
  const changes=calculate(old,neu,{timeout:80,maxEditLength:5000});if(!changes){const id=result.changes.length;result.coarseBlocks++;result.changes.push({left:l,right:r});if(l!==null&&old)result.left[l].push({start:0,end:old.length,id});if(r!==null&&neu)result.right[r].push({start:0,end:neu.length,id});continue;}
  let oldOffset=0,newOffset=0,active=null;
  for(const part of changes){if(!part.added&&!part.removed){oldOffset+=part.value.length;newOffset+=part.value.length;active=null;continue;}
   if(active===null){active=result.changes.length;result.changes.push({left:l,right:r});}
   if(part.removed){result.left[l].push({start:oldOffset,end:oldOffset+part.value.length,id:active});oldOffset+=part.value.length;}
   else {result.right[r].push({start:newOffset,end:newOffset+part.value.length,id:active});newOffset+=part.value.length;}
  }
 }
 return result;
}
export function textBlocks(article){
 const blocks=[],byElement=new Map(),walker=article.ownerDocument.createTreeWalker(article,4);let node;
 while((node=walker.nextNode())){
  const block=node.parentElement.closest('h1,h2,h3,h4,h5,h6,p,li,td,th,pre,blockquote')||article;
  if(!byElement.has(block)){const entry={element:block,text:'',nodes:[]};byElement.set(block,entry);blocks.push(entry);}
  const entry=byElement.get(block);entry.nodes.push({node,start:entry.text.length});entry.text+=node.textContent;
 }
 const result=[];
 for(const block of blocks){
  if(!block.element.matches('.plain-content')){if(block.text.trim())result.push(block);continue;}
  const pattern=/(?:\r?\n[ \t]*){2,}/g;let start=0,match,nodeCursor=0;
  function append(end){const text=block.text.slice(start,end);if(!text.trim())return;while(nodeCursor<block.nodes.length&&block.nodes[nodeCursor].start+block.nodes[nodeCursor].node.textContent.length<=start)nodeCursor++;const nodes=[];for(let index=nodeCursor;index<block.nodes.length&&block.nodes[index].start<end;index++)nodes.push({node:block.nodes[index].node,start:block.nodes[index].start-start});result.push({element:block.element,text,nodes});}
  while((match=pattern.exec(block.text))){append(match.index);start=pattern.lastIndex;}
  append(block.text.length);
 }
 return result;
}
export function clearTextMarks(article){article.querySelectorAll('mark[data-text-change],mark[data-text-relation]').forEach(mark=>mark.replaceWith(...mark.childNodes));article.normalize();}
export function markTextBlocks(blocks,ranges,side,relations=false){
 const perNode=new Map();
 blocks.forEach((block,index)=>{for(const {node,start} of block.nodes){const end=start+node.textContent.length;
  for(const range of ranges[index]||[]){if(range.end<=start||range.start>=end)continue;if(!perNode.has(node))perNode.set(node,[]);perNode.get(node).push({start:Math.max(0,range.start-start),end:Math.min(node.textContent.length,range.end-start),id:range.id,kind:range.kind,label:range.label,first:range.start>=start&&range.start<end});}
 }});
 for(const [node,segments] of perNode){const text=node.textContent,fragment=node.ownerDocument.createDocumentFragment();let cursor=0;
  for(const range of segments.sort((a,b)=>a.start-b.start)){if(range.start>cursor)fragment.append(node.ownerDocument.createTextNode(text.slice(cursor,range.start)));const mark=node.ownerDocument.createElement('mark');if(relations){mark.className='text-relation relation-'+range.kind;mark.dataset.textRelation=String(range.id);if(range.first)mark.dataset.label=range.label;}else{mark.className='text-change '+(side==='left'?'text-removed':'text-added');mark.dataset.textChange=String(range.id);}mark.textContent=text.slice(range.start,range.end);mark.title=side==='left'?'Text nur hier bzw. geändert':'Neuer bzw. geänderter Text';fragment.append(mark);cursor=range.end;}
  if(cursor<text.length)fragment.append(node.ownerDocument.createTextNode(text.slice(cursor)));node.replaceWith(fragment);
 }
}

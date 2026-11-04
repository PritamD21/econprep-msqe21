const fs=require('fs'),path=require('path'),assert=require('assert');
const bank=JSON.parse(fs.readFileSync('dist/paper-bank.json','utf8'));
const katex=require('./dist/vendor/katex/katex.min.js');
const docs=new Map(bank.documents.map(d=>[d.id,d])),qs=new Map(),errors=[];
let formulas=0;
for(const d of docs.values())if(!/^https:\/\//.test(d.url))assert(fs.existsSync(path.join('dist',d.url)),d.url);
for(const q of bank.questions){
 assert(!qs.has(q.id),q.id);qs.set(q.id,q);
 const d=docs.get(q.sourceDoc);assert(d,q.id);assert(q.sourcePage>=1&&q.sourcePage<=d.pages,`${q.id}: source page`);
 if(q.paper==='PEA'){assert(q.options.length===4,q.id);if(q.status==='verified')assert(Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4,q.id);}
 for(const img of [...q.images||[],...q.solutionImages||[]])assert(fs.existsSync(path.join('dist',img)),img);
 for(const field of ['stem','answer','solution','hint','notes','context',...(q.options||[]).map((_,i)=>`option${i}`),...(q.solutionSteps||[]).map((_,i)=>`step${i}`)]){
  const text=field.startsWith('option')?q.options[Number(field.slice(6))]:field.startsWith('step')?q.solutionSteps[Number(field.slice(4))].body:q[field]||'';
  for(const m of text.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\\)\$([^$]*?)(?<!\\)\$|\\\(([\s\S]*?)\\\)|\\\[([\s\S]*?)\\\]/g)){
   const tex=m[1]??m[2]??m[3]??m[4];formulas++;
   try{katex.renderToString(tex,{throwOnError:true,strict:'ignore'});}catch(e){errors.push({id:q.id,field,tex,error:e.message});}
  }
 }
}
for(const p of bank.papers){assert(p.itemCount===p.questionIds.length,p.id);for(const id of p.questionIds)assert(qs.get(id)?.paperId===p.id,id);}
if(errors.length){console.error(JSON.stringify(errors,null,2));process.exit(1);}
console.log(`Validated ${qs.size} questions, ${bank.papers.length} papers, ${docs.size} PDFs and ${formulas} math expressions.`);

// Weightage counts source items, including flagged questions and descriptive subparts.
const taggedPaperQuestions=globalThis.PAPER_BANK?PAPER_BANK.questions.map(q=>({paper:q.paper,paperId:q.paperId,year:q.year,topic:q.topic,kind:q.kind,questionId:q.id})):[];
const weightageTopics=['Algebra','Linear algebra','Calculus','Probability','Statistics','Microeconomics','Macroeconomics'];

function analyticsSummary(sessions, paper='all', days=0, now=Date.now()){
  const filtered=sessions.filter(s=>(paper==='all'||s.track===paper)&&(!days||new Date(s.date).getTime()>=now-days*86400000));
  const scored=filtered.filter(s=>s.track==='PEA'&&Number.isFinite(s.score)&&Number.isFinite(s.scorableTotal??s.total)&&(s.scorableTotal??s.total)>0);
  const percentages=scored.map(s=>100*s.score/(s.scorableTotal??s.total));
  const byTopic={};
  for(const session of filtered){
    for(const detail of session.details||[]){
      const row=byTopic[detail.topic]??={topic:detail.topic,correct:0,incorrect:0,skipped:0,practiced:0,pebQuestions:0,hints:0};
      if(session.track==='PEA'&&['correct','incorrect','skipped'].includes(detail.status))row[detail.status]++;
      if(session.track==='PEB'){row.pebQuestions++;if(detail.status==='practiced')row.practiced++;if(detail.hintUsed)row.hints++;}
    }
  }
  return {sessions:filtered,scored,average:percentages.length?percentages.reduce((a,b)=>a+b,0)/percentages.length:null,best:percentages.length?Math.max(...percentages):null,attempted:filtered.reduce((sum,s)=>sum+(Number(s.answered)||0),0),topics:Object.values(byTopic).sort((a,b)=>a.topic.localeCompare(b.topic)),legacy:filtered.filter(s=>!Array.isArray(s.details)).length};
}

function topicWeights(records,paper='PEA',year='all',kind='all'){
  const selected=records.filter(q=>q.paper===paper&&(year==='all'||String(q.year)===String(year))&&(kind==='all'||q.kind===kind));
  const counts=new Map(weightageTopics.map(t=>[t,0]));
  for(const q of selected)counts.set(q.topic,(counts.get(q.topic)||0)+1);
  return {total:selected.length,papers:new Set(selected.map(q=>q.paperId||`${q.paper}-${q.year}`)).size,rows:[...counts].map(([topic,count])=>({topic,count,percent:selected.length?count/selected.length*100:null}))};
}

globalThis.EconMetrics={analyticsSummary,topicWeights};

function analytics(){return `${heading('Analytics','Past performance · Saved in this browser')}<div class="filters insights-filters"><label>Paper<select id="analytics-paper" aria-label="Paper"><option value="all">PEA & PEB</option><option value="PEA">PEA</option><option value="PEB">PEB</option></select></label><label>Period<select id="analytics-period" aria-label="Period"><option value="0">All time</option><option value="30">Last 30 days</option><option value="7">Last 7 days</option></select></label></div><div id="analytics-body"></div>`}

function performanceChart(sessions){
  if(!sessions.length)return '<div class="chart-empty">No PEA scores in this selection.</div>';
  const scored=sessions.slice(-12),width=600,height=200,left=40,right=18,top=18,bottom=33;
  const points=scored.map((s,i)=>({x:scored.length===1?(width+left-right)/2:left+i*(width-left-right)/(scored.length-1),y:top+(100-100*s.score/(s.scorableTotal??s.total))*(height-top-bottom)/100,pct:Math.round(100*s.score/(s.scorableTotal??s.total)),date:new Date(s.date).toLocaleDateString()}));
  const path=points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');
  return `<svg class="score-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="PEA score trend, oldest to newest"><title>PEA scores: ${points.map(p=>`${p.pct}% on ${safe(p.date)}`).join('; ')}</title>${[0,50,100].map(v=>{const y=top+(100-v)*(height-top-bottom)/100;return `<line x1="${left}" x2="${width-right}" y1="${y}" y2="${y}" stroke="#e3e8dc"/><text x="0" y="${y+4}" font-size="12" fill="#7a8870">${v}%</text>`}).join('')}<path d="${path}" fill="none" stroke="#184e3d" stroke-width="3"/>${points.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="5" fill="#184e3d"><title>${p.pct}% · ${safe(p.date)}</title></circle>`).join('')}<text x="${left}" y="${height-6}" font-size="12" fill="#7a8870">Older</text><text x="${width-right}" y="${height-6}" text-anchor="end" font-size="12" fill="#7a8870">Latest</text></svg>`;
}

function renderAnalytics(){
  const data=analyticsSummary(history,$('#analytics-paper').value,Number($('#analytics-period').value));
  const percent=n=>n===null?'—':`${Math.round(n)}%`;
  $('#analytics-body').innerHTML=`<div class="stats">${stat('◷',data.sessions.length,'Sessions')}${stat('↗',percent(data.average),'Average PEA score')}${stat('◎',percent(data.best),'Best PEA score')}${stat('▤',data.attempted,'Answered / practiced')}</div><div class="insight-grid"><section class="insight-card"><div class="section-head"><h2>Score trend</h2><span class="pill">PEA</span></div>${performanceChart(data.scored)}<p class="insight-caption">Latest 12 PEA sessions · Correct ÷ scorable questions</p></section><section class="insight-card"><h2>Topic performance</h2>${data.topics.length?`<div class="table-scroll"><table class="insight-table"><thead><tr><th>Topic</th><th>PEA accuracy</th><th>PEB practice</th></tr></thead><tbody>${data.topics.map(t=>{const attempts=t.correct+t.incorrect;return `<tr><th>${safe(t.topic)}</th><td>${attempts?`${Math.round(t.correct/attempts*100)}%<small>${t.correct} / ${attempts} correct</small>`:'—'}</td><td>${t.pebQuestions?`${t.practiced} / ${t.pebQuestions}<small>Hint uses: ${t.hints}</small>`:'—'}</td></tr>`}).join('')}</tbody></table></div><p class="insight-caption">Accuracy excludes skipped questions. PEB is self-reviewed.</p>`:'<div class="chart-empty">New practice sessions will show topic strengths and gaps here.</div>'}${data.legacy?'<p class="insight-caption">Older sessions have scores but no topic breakdown.</p>':''}</section></div><section class="insight-card history-card"><div class="section-head"><h2>Past sessions</h2><button class="text-button" data-go="practice">Practice ↗</button></div>${data.sessions.length?`<div class="table-scroll"><table class="insight-table"><thead><tr><th>Date</th><th>Paper</th><th>Score</th><th>Completion</th></tr></thead><tbody>${data.sessions.slice().reverse().map(s=>`<tr><td>${safe(new Date(s.date).toLocaleString())}</td><td>${safe(s.track)} <small>${s.year?`${s.year} · ${s.kind==='sample'?'Sample':'Archive'}`:'Demo'}</small></td><td>${s.track==='PEA'?`${s.score} / ${s.scorableTotal??s.total}`:'Self-review'}</td><td>${s.answered} / ${s.total} ${s.track==='PEA'?'answered':'practiced'}</td></tr>`).join('')}</tbody></table></div>`:'<div class="chart-empty">No sessions in this period.</div>'}</section>`;
}

function weightage(){return `${heading('Topic weightage','Question distribution across past papers')}<div class="filters insights-filters"><label>Paper<select id="weightage-paper" aria-label="Paper"><option value="PEA">PEA</option><option value="PEB">PEB</option></select></label><label>Year<select id="weightage-year" aria-label="Year"><option value="all">All years</option>${Array.from({length:29},(_,i)=>2026-i).map(y=>`<option value="${y}">${y}</option>`).join('')}</select></label></div><label class="kind-filter">Source type<select id="weightage-kind" aria-label="Source type"><option value="all">All indexed sources</option><option value="archive">ISI archive</option><option value="sample">Sample booklets</option><option value="transcription">Paper transcriptions</option></select></label><div id="weightage-body"></div>`}

function renderWeightage(){
  const data=topicWeights(taggedPaperQuestions,$('#weightage-paper').value,$('#weightage-year').value,$('#weightage-kind').value);
  $('#weightage-body').innerHTML=`<div class="weightage-summary"><span><strong>${data.papers}</strong> tagged papers</span><span><strong>${data.total}</strong> classified questions</span><span class="pill">${data.total?'QUESTION SHARE':'IMPORT PENDING'}</span></div>${data.total?'':'<div class="notice">No indexed question items in this selection yet. Original source PDFs are available in the paper library.</div>'}<section class="insight-card"><div class="section-head"><h2>Questions by topic</h2></div><div class="table-scroll"><table class="insight-table weightage-table"><thead><tr><th>Topic</th><th>Questions</th><th>Weightage</th></tr></thead><tbody>${data.rows.map(t=>`<tr><th>${safe(t.topic)}</th><td>${t.count}</td><td><div class="weightage-cell"><span>${t.percent===null?'—':`${t.percent.toFixed(1)}%`}</span>${t.percent===null?'':`<div class="weightage-track"><div style="width:${t.percent}%"></div></div>`}</div></td></tr>`).join('')}</tbody></table></div><p class="insight-caption">Weightage = topic questions ÷ all tagged questions in the selection. Only indexed items are counted; descriptive subparts can count separately. Source types can be filtered separately. Transcription issues are flagged in the library. Practice attempts do not affect these percentages.</p></section>`;
}

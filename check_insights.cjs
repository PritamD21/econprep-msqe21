const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/insights.js','utf8'),context);
const {analyticsSummary,topicWeights}=context.EconMetrics;
const now=Date.parse('2026-10-29T00:00:00Z');
const sessions=[
 {track:'PEA',date:'2026-09-01',score:1,total:2,answered:2},
 {track:'PEA',date:'2026-10-28',score:1,total:3,answered:2,details:[{topic:'Calculus',status:'correct'},{topic:'Calculus',status:'incorrect'},{topic:'Probability',status:'skipped'}]},
 {track:'PEB',date:'2026-10-28',score:null,total:2,answered:1,details:[{topic:'Calculus',status:'practiced',hintUsed:true},{topic:'Microeconomics',status:'unreviewed'}]}
];
const all=analyticsSummary(sessions,'all',0,now);
assert.equal(all.sessions.length,3);assert.equal(all.legacy,1);assert.equal(all.attempted,5);assert.equal(Math.round(all.average),42);assert.equal(all.best,50);
const calculus=all.topics.find(t=>t.topic==='Calculus');assert.equal(calculus.correct,1);assert.equal(calculus.incorrect,1);assert.equal(calculus.practiced,1);assert.equal(calculus.hints,1);
assert.equal(analyticsSummary(sessions,'all',7,now).sessions.length,2);
assert.equal(analyticsSummary(sessions,'PEB',0,now).average,null);
assert.equal(analyticsSummary([]).best,null);
const records=[{paper:'PEA',year:2024,topic:'Calculus'},{paper:'PEA',year:2024,topic:'Calculus'},{paper:'PEA',year:2023,topic:'Statistics'},{paper:'PEB',year:2024,topic:'Microeconomics'}];
assert.equal(topicWeights(records,'PEA','2024').total,2);
assert.equal(topicWeights(records,'PEA','2024').rows.find(t=>t.topic==='Calculus').percent,100);
assert.equal(topicWeights(records,'PEA','all').papers,2);
assert.equal(topicWeights(records,'PEB','2024').total,1);
assert.equal(topicWeights([],'PEA','all').rows[0].percent,null);
console.log('Analytics aggregation, date filters, legacy sessions, PEB self-review, and topic-weightage calculations passed.');

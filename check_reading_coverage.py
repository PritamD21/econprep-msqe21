from pathlib import Path
import json,re
root=Path(__file__).parent
bank=json.loads((root/'dist/paper-bank.json').read_text(encoding='utf-8'))
rows=[q for q in bank['questions'] if q['paper']=='PEB']
for q in rows:
 assert len(q.get('solutionSteps',[]))>=1,q['id']
 assert all(step.get('title') and step.get('body') for step in q['solutionSteps']),q['id']
 for value in [q['solution']]+[step['body'] for step in q['solutionSteps']]:
  assert '\\n\\n' not in value,('Literal paragraph escapes',q['id'])
 assert all(not (ord(c)<32 and c not in '\n\r\t') for c in q['solution']),q['id']
index=(root/'dist/index.html').read_text(encoding='utf-8')
assert 'data-page="practice"' not in index and 'Mock tests' not in index
assert 'Pritam Das' in index
print(json.dumps(dict(pebItems=len(rows),structuredItems=sum(bool(q.get('solutionSteps')) for q in rows),steps=sum(len(q['solutionSteps']) for q in rows),recentSets=[p['id'] for p in bank['papers'] if p['year']>=2025])))

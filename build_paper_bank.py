"""Build a provenance-preserving bank from supplied PDFs and reviewed JSON records."""
from pathlib import Path
import hashlib,json,re,shutil
ROOT=Path(__file__).parent
WORK=ROOT.parent/'paper-content'
if not WORK.exists():WORK=ROOT/'content'
SRC=Path(r'C:\Users\email\OneDrive\Desktop\ISI 2026 - Achyut\ISI 2025\ISI PYQ\PYQS\ISI')
OUT=ROOT/'dist'
(OUT/'papers').mkdir(exist_ok=True)
inventory_path=WORK/'inventory.json' if (WORK/'inventory.json').exists() else WORK/'source-inventory.json'
inventory=json.loads(inventory_path.read_text(encoding='utf-8'))
docs=[];by_name={};seen={}
for row in inventory:
    if row['sha256'] in seen:
        by_name[row['filename']]=seen[row['sha256']];continue
    name=row['filename'];year=row['year'];docid=f"src-{year}-{row['sha256'][:10]}"
    kind='sample' if 2004<=year<=2015 or 'Sample' in name else 'archive'
    document=dict(id=docid,filename=name,year=year,kind=kind,pages=row['pages'],url=f'papers/{docid}.pdf',sha256=row['sha256'])
    if (SRC/name).exists():shutil.copy2(SRC/name,OUT/document['url'])
    else:assert (OUT/document['url']).exists(),f'Missing original PDF: {name}'
    docs.append(document);seen[row['sha256']]=document;by_name[name]=document
official_docs={}
official_manifest=WORK/'official/sources.json' if (WORK/'official/sources.json').exists() else WORK/'official-sources.json'
for source in json.loads(official_manifest.read_text()):
    m=re.fullmatch(r'(\d{4})-(PE[AB])\.pdf',source['filename']);year=int(m[1]);track=m[2]
    docid=f'official-{year}-{track.lower()}'
    doc=dict(id=docid,filename=f'Official ISI {track} {year}.pdf',year=year,kind='archive',pages=source['pages'],url=f'papers/{docid}.pdf',officialUrl=source['url'])
    if (WORK/'official'/source['filename']).exists():shutil.copy2(WORK/'official'/source['filename'],OUT/doc['url'])
    else:assert (OUT/doc['url']).exists(),f'Missing official PDF: {source["filename"]}'
    docs.append(doc);official_docs[(year,track)]=docid
for d in docs:
    if d['filename']=='ISI 2022.pdf':d['notes']='The supplied compilation includes the first page of a 2023 paper at its end. It is not counted as 2022 content.'

source_defaults={2012:'msqe2012_merged.pdf',2013:'ISI MSQE 2013.pdf',2014:'ISI 2014.pdf',2015:'msqe2015_merged.pdf',2016:'MSQE-PEA-2016.pdf',2023:'ISI 2023.pdf',2024:'MSQE-PEB-2024.pdf'}
topics={'Algebra','Linear algebra','Calculus','Probability','Statistics','Microeconomics','Macroeconomics'}
all_questions=[];paper_rows={};ids=set()
question_dir=WORK/'solutions' if (WORK/'solutions').exists() else WORK/'questions'
for f in sorted(question_dir.glob('*.json')):
    match=re.fullmatch(r'(\d{4})-(pea|peb)(-(?:sample|official))?\.json',f.name)
    if not match:continue
    year=int(match[1]);track=match[2].upper();variant=match[3][1:] if match[3] else ''
    rows=json.loads(f.read_text(encoding='utf-8'))
    for q in rows:
        assert q['id'] not in ids,q['id'];ids.add(q['id'])
        assert q['stem'] and q['solution'] and q['hint'],q['id']
        assert q['topic'] in topics,(q['id'],q['topic'])
        assert q['status'] in ['verified','needs_review'],q['id']
        if track=='PEA':
            assert len(q.get('options',[]))==4,q['id']
            if q['status']=='verified':assert isinstance(q.get('correctIndex'),int) and 0<=q['correctIndex']<4,q['id']
        q['year']=year;q['paper']=track;q['paperId']=f'{year}-{track}'+('-'+variant if variant else '')
        q['kind']=q.get('sourceKind','sample' if year<=2015 else 'archive')
        if (track=='PEA' and not variant or variant=='official') and (year,track) in official_docs:q['sourceDoc']=official_docs[(year,track)]
        else:
            filename=q.get('sourceFile') or q.get('sourceFilename') or ('msqe2016_merged.pdf' if year==2016 and track=='PEB' else source_defaults.get(year))
            if filename not in by_name:
                candidates=[d for d in docs if d['year']==year and ('PEA' not in d['filename'] and 'PEB' not in d['filename'])]
                assert candidates,(q['id'],filename)
                filename=candidates[0]['filename']
            q['sourceDoc']=by_name[filename]['id']
        assert q['sourcePage']>0,q['id']
        q['notes']=q.get('notes','')
        all_questions.append(q)
    paper_rows[(year,track,variant)]=rows

papers=[]
for year in range(1998,2025):
    for track in ['PEA','PEB']:
        qs=paper_rows.get((year,track,''),[])
        source_docs=[d['id'] for d in docs if d['year']==year and not ('PEA' in d['filename'] and track=='PEB') and not ('PEB' in d['filename'] and track=='PEA')]
        source_docs=list(dict.fromkeys([q['sourceDoc'] for q in qs]+source_docs))
        main_numbers={re.match(r'\d+',str(q['number']))[0] for q in qs}
        papers.append(dict(id=f'{year}-{track}',year=year,paper=track,kind=qs[0]['kind'] if qs else ('sample' if year<=2015 else 'archive'),title=f'ISI MSQE {year} · {track}',questionIds=[q['id'] for q in qs],itemCount=len(qs),mainCount=len(main_numbers),checkedCount=sum(q['status']=='verified' for q in qs),reviewCount=sum(q['status']=='needs_review' for q in qs),documents=source_docs,status='study_ready' if qs else 'source_only',answerProvenance='Independently derived; not an official answer key.'))
for (year,track,variant),qs in paper_rows.items():
    if not variant:continue
    papers.append(dict(id=f'{year}-{track}-{variant}',year=year,paper=track,variant=variant,kind='sample' if variant=='sample' else 'archive',title=f'ISI MSQE {year} · {track} · '+('Sample' if variant=='sample' else 'Written archive'),questionIds=[q['id'] for q in qs],itemCount=len(qs),mainCount=len({re.match(r'\d+',str(q['number']))[0] for q in qs}),checkedCount=sum(q['status']=='verified' for q in qs),reviewCount=sum(q['status']=='needs_review' for q in qs),documents=list(dict.fromkeys(q['sourceDoc'] for q in qs)),status='study_ready',answerProvenance='Independently derived; not an official answer key.'))
papers.sort(key=lambda p:(p['year'],p['paper'],p.get('variant','')))
content=ROOT/'content';(content/'questions').mkdir(parents=True,exist_ok=True)
for f in question_dir.glob('*.json'):
    if re.fullmatch(r'\d{4}-(pea|peb)(-(?:sample|official))?\.json',f.name) and f.resolve()!=(content/'questions'/f.name).resolve():shutil.copy2(f,content/'questions'/f.name)
if inventory_path.resolve()!=(content/'source-inventory.json').resolve():shutil.copy2(inventory_path,content/'source-inventory.json')
if official_manifest.resolve()!=(content/'official-sources.json').resolve():shutil.copy2(official_manifest,content/'official-sources.json')
bank=dict(version=1,documents=docs,papers=papers,questions=all_questions,sourceFileCount=len(inventory),uniqueSourceCount=len(seen),years=27)
(OUT/'paper-bank.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT/'paper-bank.js').write_text('globalThis.PAPER_BANK='+json.dumps(bank,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')+';\n',encoding='utf-8')
coverage={k:bank[k] for k in ['sourceFileCount','uniqueSourceCount','years']}
coverage.update(items=len(all_questions),checked=sum(q['status']=='verified' for q in all_questions),review=sum(q['status']=='needs_review' for q in all_questions),structuredPapers=sum(bool(p['itemCount']) for p in papers),sourceOnlyPapers=sum(not p['itemCount'] for p in papers))
(WORK/'coverage.json').write_text(json.dumps(coverage,indent=2),encoding='utf-8')
print(json.dumps(coverage))

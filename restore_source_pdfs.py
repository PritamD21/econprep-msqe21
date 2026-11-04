"""Restore PDF assets omitted from the private GitHub source mirror."""
from pathlib import Path
import argparse,hashlib,json,shutil,urllib.request
root=Path(__file__).parent
parser=argparse.ArgumentParser()
parser.add_argument('--source-directory',type=Path,help='Folder containing the originally supplied PDFs')
parser.add_argument('--download-official',action='store_true',help='Download missing official ISI archive PDFs')
args=parser.parse_args()
bank=json.loads((root/'dist/paper-bank.json').read_text(encoding='utf-8'))
missing=[]
for doc in bank['documents']:
 if doc['url'].startswith('https://'):continue
 out=root/'dist'/doc['url'];out.parent.mkdir(exist_ok=True)
 if out.exists():continue
 original=args.source_directory/doc['filename'] if args.source_directory else None
 if original and original.is_file():
  if doc.get('sha256') and hashlib.sha256(original.read_bytes()).hexdigest()!=doc['sha256']:raise ValueError(f'Source checksum differs: {original.name}')
  shutil.copy2(original,out)
 elif args.download_official and doc.get('officialUrl'):
  with urllib.request.urlopen(doc['officialUrl']) as response:out.write_bytes(response.read())
 else:missing.append(doc['filename'])
print(f'PDFs still missing: {len(missing)}')
for name in missing:print(name)

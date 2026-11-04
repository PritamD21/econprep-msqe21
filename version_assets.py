from pathlib import Path
import hashlib,re
root=Path(__file__).parent/'dist'
p=root/'index.html';html=p.read_text(encoding='utf-8')
def version(match):
 name=match[2].split('?')[0]
 file=root/name
 if not file.is_file():return match[0]
 digest=hashlib.sha256(file.read_bytes()).hexdigest()[:10]
 return match[1]+name+'?v='+digest+match[3]
html=re.sub(r'(<script src="|<link rel="stylesheet" href=")([^"#]+)(")',version,html)
p.write_text(html,encoding='utf-8')
print('Versioned local scripts and styles so published updates do not reuse stale cached files.')

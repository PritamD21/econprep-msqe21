from pathlib import Path
import re,zipfile
root=Path(__file__).parent
html=(root/'dist/index.html').read_text(encoding='utf-8')
html=html.replace('<head>','<head><base href="./dist/">',1)
def css(m):
    name=m[1]
    return m[0] if name.startswith('vendor/') else '<style>'+(root/'dist'/name).read_text(encoding='utf-8')+'</style>'
def script(m):
    name=m[1]
    return m[0] if name.startswith('vendor/') else '<script>'+(root/'dist'/name).read_text(encoding='utf-8').replace('</script','<\\/script')+'</script>'
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',css,html)
html=re.sub(r'<script src="([^"]+)"></script>',script,html)
(root/'EconPrep.html').write_text(html,encoding='utf-8')
with zipfile.ZipFile(root.parent/'EconPrep-source.zip','w',zipfile.ZIP_DEFLATED) as z:
    for p in (root/'dist').rglob('*'):
        if p.is_file():z.write(p,p.relative_to(root))
    for p in (root/'content').rglob('*'):
        if p.is_file():z.write(p,p.relative_to(root))
    for name in ['EconPrep.html','README.md','build_paper_bank.py','package_paper_app.py','check_insights.cjs','check_paper_bank.cjs','check_paper_engine.cjs','restore_source_pdfs.py']:
        z.write(root/name,name)
print('Packaged the app, bank, local maths assets and original papers.')

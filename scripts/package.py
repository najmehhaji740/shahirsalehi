from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
with ZipFile(root/'shahir-salehi-website.zip','w',ZIP_DEFLATED) as out:
    for file in sorted(root.rglob('*')):
        rel=file.relative_to(root)
        if file.is_file() and not any(p in {'.git','node_modules','.test-results','__pycache__'} for p in rel.parts) and file.suffix!='.zip':
            out.write(file,'shahir-salehi-website/'+str(rel))
print('Packaged source, documentation, tests, and dist/ in shahir-salehi-website.zip')
with ZipFile(root/'shahir-salehi-cloudflare.zip','w',ZIP_DEFLATED) as out:
    for file in sorted((root/'dist').rglob('*')):
        if file.is_file():out.write(file,str(file.relative_to(root/'dist')))
print('Packaged deployment-only output in shahir-salehi-cloudflare.zip')

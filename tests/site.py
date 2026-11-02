"""Validate the generated output, not just the content model. No third-party packages required."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
import json, re, hashlib, base64
root=Path(__file__).resolve().parents[1]; dist=root/'dist'
class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags=[];self.ids=[];self.links=[];self.scripts=[];self.text=[];self.script=None;self.h1=0;self.heading=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);self.tags.append((tag,attrs))
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag in ['a','link'] and 'href' in attrs:self.links.append(attrs['href'])
        if tag in ['img','script'] and 'src' in attrs:self.links.append(attrs['src'])
        if tag=='script':self.script={'attrs':attrs,'body':''}
        if tag=='h1':self.h1+=1
        if re.fullmatch('h[1-6]',tag):self.heading.append(int(tag[1]))
    def handle_endtag(self,tag):
        if tag=='script' and self.script:self.scripts.append(self.script);self.script=None
    def handle_data(self,data):
        if self.script is not None:self.script['body']+=data
        else:self.text.append(data)
    def attr(self,tag,key,value,attribute):
        return [a.get(attribute) for t,a in self.tags if t==tag and a.get(key)==value]
files=sorted(dist.rglob('*.html')); docs={}
for f in files:
    route='/'+str(f.relative_to(dist)).replace('index.html','')
    docs[route]=Document(f.read_text())
expected=json.loads((root/'docs/routes.json').read_text())
assert set(docs)=={p['path'] for p in expected},'Route inventory and generated HTML disagree'
indexable_count=sum(not p['noindex'] for p in expected)
titles=[];descriptions=[];links=0
edges={route:set() for route in docs}
headers=(dist/'_headers').read_text()
for route,doc in docs.items():
    assert doc.h1==1,(route,'H1',doc.h1)
    assert len(doc.ids)==len(set(doc.ids)),(route,'duplicate id')
    for prev,level in zip(doc.heading,doc.heading[1:]):assert level<=prev+1,(route,'skipped heading',prev,level)
    title=re.search('<title>(.*?)</title>',(dist/(route.lstrip('/')+'index.html' if route.endswith('/') else route.lstrip('/'))).read_text()).group(1)
    titles.append(title)
    desc=doc.attr('meta','name','description','content');assert len(desc)==1 and desc[0].strip(),(route,'description');descriptions.extend(desc)
    assert doc.attr('link','rel','canonical','href')==['https://shahirsalehi.com'+route],(route,'canonical')
    assert doc.attr('meta','name','viewport','content'),(route,'viewport')
    assert doc.attr('meta','property','og:image','content'),(route,'og image')
    assert doc.attr('meta','name','twitter:card','content')==['summary_large_image']
    assert any(t=='html' and a.get('lang')=='en' for t,a in doc.tags)
    for script in doc.scripts:
        if script['attrs'].get('type')=='application/ld+json':
            data=json.loads(script['body']);assert data['@context']=='https://schema.org';assert data['@graph']
            assert not any(k in script['body'] for k in ['aggregateRating','reviewRating','streetAddress'])
        if script['body']:
            assert script['attrs'].get('type') in ['application/json','application/ld+json'],(route,'unexpected inline executable script')
    for link in doc.links:
        url=urlsplit(link)
        if url.scheme in ['mailto','tel'] or url.netloc and url.netloc!='shahirsalehi.com':continue
        assert not url.scheme or url.scheme=='https',(route,'unsafe scheme',link)
        dest=unquote(url.path) or route
        if not dest.startswith('/'):raise AssertionError((route,'relative link',dest))
        if dest in docs:
            edges[route].add(dest)
            if url.fragment:assert url.fragment in docs[dest].ids,(route,'missing anchor',link)
        else:assert (dist/dest.lstrip('/')).is_file(),(route,'missing link',link)
        links+=1
    assert 'content goes here' not in ' '.join(doc.text).lower()
assert len(titles)==len(set(titles)),'duplicate titles'
assert len(descriptions)==len(set(descriptions)),'duplicate descriptions'
seen={'/'};todo=['/']
while todo:
    for dest in edges[todo.pop()]-seen:seen.add(dest);todo.append(dest)
assert set(docs)-seen=={'/404.html'},('orphan pages',set(docs)-seen)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap=ET.parse(dist/'sitemap.xml');locations=[x.text for x in sitemap.findall('.//s:loc',ns)]
assert len(locations)==indexable_count and len(set(locations))==indexable_count
assert set(locations)=={'https://shahirsalehi.com'+r for r in docs if r!='/404.html'}
assert 'noindex' in docs['/404.html'].attr('meta','name','robots','content')[0]
assert all('noindex' not in d.attr('meta','name','robots','content')[0] for r,d in docs.items() if r!='/404.html')
assert 'Sitemap: https://shahirsalehi.com/sitemap.xml' in (dist/'robots.txt').read_text()
for file in ['favicon.svg','favicon.ico','apple-touch-icon.png','icon-192.png','icon-512.png','social-card.png','site.webmanifest','llms.txt','_headers','_redirects','downloads/project-preparation.txt']:assert (dist/file).is_file(),file
assert '/* /index.html' not in (dist/'_redirects').read_text(),'SPA fallback is forbidden'
assert all(len(line)<=2000 for line in headers.splitlines()),'Cloudflare header line exceeds 2000 characters'
assert "'unsafe-inline'" not in headers and "'unsafe-eval'" not in headers
manifest=json.loads((dist/'site.webmanifest').read_text());assert len(manifest['icons'])==2
for icon in manifest['icons']:assert (dist/icon['src'].lstrip('/')).is_file()
assert len([p for p in (root/'docs/SEO-INVENTORY.md').read_text().splitlines() if p.startswith('| /')])==len(docs)
print(f'PASS: {len(docs)} HTML pages; {len(locations)} sitemap URLs; {links} internal links/assets; no orphan indexable pages.')
print('PASS: unique titles/descriptions, canonical URLs, H1s, heading hierarchy, anchor targets, JSON-LD, strict CSP, required assets, indexing, and manifest.')

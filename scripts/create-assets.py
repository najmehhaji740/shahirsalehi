"""Recreate original text-only brand assets. Requires Pillow; not needed for normal builds."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[1]/'public'
navy='#102A43'; teal='#0F8B8D'; mint='#E9F3F1'
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
bold='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def monogram(size):
    image=Image.new('RGB',(size,size),navy); draw=ImageDraw.Draw(image)
    f=ImageFont.truetype(bold,int(size*.58))
    draw.text((size*.11,size*.08),'ss',font=f,fill='white')
    draw.ellipse((size*.78,size*.67,size*.88,size*.77),fill=teal)
    return image
monogram(256).save(root/'favicon.ico',sizes=[(16,16),(32,32),(48,48),(64,64)])
for size,name in [(180,'apple-touch-icon.png'),(192,'icon-192.png'),(512,'icon-512.png')]:monogram(size).save(root/name,optimize=True)
image=Image.new('RGB',(1200,630),navy);draw=ImageDraw.Draw(image)
draw.rectangle((70,70,76,560),fill=teal)
draw.text((110,83),'SHAHIR SALEHI',font=ImageFont.truetype(bold,20),fill=mint)
draw.text((106,175),'Connected thinking.',font=ImageFont.truetype(bold,68),fill='white')
draw.text((110,290),'Digital marketing & technology strategy',font=ImageFont.truetype(font,33),fill='#b7d0d8')
draw.line((110,410,1080,410),fill='#426071',width=2)
draw.text((110,451),'10+ years  /  200+ websites & e-commerce builds',font=ImageFont.truetype(font,24),fill='white')
draw.text((110,530),'shahirsalehi.com',font=ImageFont.truetype(font,21),fill='#7ed1c7')
image.save(root/'social-card.png',optimize=True)

"""Read the supplied raster PDF into local review sheets; never alter the PDF."""
from pathlib import Path
from io import BytesIO
from pypdf import PdfReader
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
source = root.parent / 'New Website' / 'PuttBrothers_Product_Catalogue_2026.pdf (1).pdf'
out = root / 'tmp' / 'v2-reference-review'
out.mkdir(parents=True, exist_ok=True)
reader = PdfReader(source)
previews = []
for i, page in enumerate(reader.pages, 1):
    pictures = list(page.images)
    if not pictures:
        raise RuntimeError(f'No raster image found on page {i}; render with Poppler instead')
    largest = max(pictures, key=lambda p: len(p.data))
    picture = Image.open(BytesIO(largest.data)).convert('RGB')
    picture.thumbnail((1000, 900))
    picture.save(out / f'page-{i:02d}.jpg', quality=88)
    tile = Image.new('RGB', (840, 630), '#eeeeee')
    thumb = ImageOps.contain(picture, (820, 590))
    tile.paste(thumb, ((840-thumb.width)//2, 30+(590-thumb.height)//2))
    ImageDraw.Draw(tile).text((12, 8), f'CATALOGUE - PAGE {i:02d}', fill='black')
    previews.append(tile)
for start in range(0, len(previews), 6):
    sheet = Image.new('RGB', (1680, 1890), 'white')
    for j, tile in enumerate(previews[start:start+6]):
        sheet.paste(tile, ((j%2)*840, (j//2)*630))
    sheet.save(out / f'sheet-{start//6+1}.jpg', quality=90)
print(f'Reviewed raster structure: {len(reader.pages)} pages; outputs at {out}')

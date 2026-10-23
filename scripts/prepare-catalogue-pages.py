"""Render existing catalogue PDFs to versioned WebP pages, preserving the PDFs.

Requires bundled Python (Pillow, pypdf) and Poppler's pdftoppm on PATH.
Run from any directory: python scripts/prepare-catalogue-pages.py
"""
from hashlib import sha256
import json
from pathlib import Path
import shutil
import subprocess
from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
POPPLER = shutil.which("pdftoppm")
if not POPPLER:
    raise SystemExit("Poppler pdftoppm is required")

manifest = ROOT / "lib" / "catalogue-pages.json"
previous = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {}
catalogues = {}
for key, title, filename in (
    ("minigolf", "Mini Golf", "minigolf-latest.pdf"),
    ("tablegolf", "Table Golf", "tablegolf-latest.pdf"),
    ("complete2026", "Complete 2026", "puttbrothers-2026.pdf"),
):
    pdf = ROOT / "public" / "catalogues" / filename
    digest = sha256(pdf.read_bytes()).hexdigest()
    cached = previous.get(key)
    if cached and cached["sourceSha256"] == digest and len(cached["pages"]) == len(PdfReader(pdf).pages):
        variants = [variant for page in cached["pages"] for variant in page.values()]
        if all((ROOT / "public" / item["src"].lstrip("/")).is_file() and
               sha256((ROOT / "public" / item["src"].lstrip("/")).read_bytes()).hexdigest() == item["sha256"]
               for item in variants):
            catalogues[key] = cached
            print(f"{title}: {len(cached['pages'])} existing pages verified", flush=True)
            continue
    release = f"{key}-{digest[:10]}"
    output = ROOT / "public" / "images" / "catalogues" / release
    output.mkdir(parents=True, exist_ok=True)
    temp = ROOT / "tmp" / "pdfs" / release
    temp.mkdir(parents=True, exist_ok=True)
    pages = []
    for number, _ in enumerate(PdfReader(pdf).pages, 1):
        prefix = temp / f"page-{number:02d}"
        subprocess.run([
            POPPLER, "-f", str(number), "-l", str(number), "-singlefile",
            "-scale-to", "1800", "-png", str(pdf), str(prefix),
        ], check=True, capture_output=True)
        png = prefix.with_suffix(".png")
        with Image.open(png) as source:
            source = source.convert("RGB")
            variants = {}
            for width in (900, 1800):
                image = source.copy()
                image.thumbnail((width, width), Image.Resampling.LANCZOS)
                name = f"page-{number:02d}-{width}.webp"
                target = output / name
                image.save(target, "WEBP", quality=86, method=6)
                variants[str(width)] = {
                    "src": f"/images/catalogues/{release}/{name}",
                    "width": image.width,
                    "height": image.height,
                    "bytes": target.stat().st_size,
                    "sha256": sha256(target.read_bytes()).hexdigest(),
                }
        png.unlink()
        pages.append(variants)
    catalogues[key] = {
        "title": title,
        "pdf": f"/catalogues/{filename}",
        "sourceSha256": digest,
        "pages": pages,
    }
    print(f"{title}: {len(pages)} pages rendered", flush=True)

manifest.write_text(json.dumps(catalogues, indent=2) + "\n", encoding="utf-8")
print(f"Manifest: {manifest.relative_to(ROOT)}")

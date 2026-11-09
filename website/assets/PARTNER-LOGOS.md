# Partner logos, 10 November 2026

## Current delivery: black One Grid and WebP

Rafael supplied a new black One Grid logo at `C:/Users/Rafael/Downloads/one grid_black.png`, 4961 x 3508. Its original is preserved locally as `assets/v2-originals/one-grid-black-source.png`. Background removal used built-in image_gen; its transparent master is `assets/v2-originals/one-grid-black-cutout.png`. The dark backing has been removed from the card.

All three cards now use transparent 600 x 180 WebP canvases, with the mark fitted to a common 110-pixel height and a 560-pixel width cap, without changing aspect ratios. EHP's wider mark fits to 106 pixels tall. The shared display area is at most 230 x 69 CSS pixels. Reproduce conversion with `node scripts/prepare-partner-logos.mjs`.

| Active asset | Bytes |
| --- | ---: |
| public/images/v2/partners/ehp-interiors-logo.webp | 12,204 |
| public/images/v2/partners/one-grid-black-logo.webp | 18,522 |
| public/images/v2/partners/ipdc-logo.webp | 11,468 |

Combined WebP delivery: 42,194 bytes, approximately 41.2 KiB. Original PNGs and earlier supplied marks are preserved. Tooltip and partner destination behavior are unchanged. The initial PNG delivery record below is historical and superseded by this section.

Exact built-in background-removal prompt:

```text
Use case: background-extraction. Asset type: existing corporate wordmark, exact reproduction as a transparent cutout, NOT a redesign. Edit the supplied original OneGrid black logo. Remove ONLY the white background to genuine alpha transparency, including the white inside O and other counters. Crop away the excessive blank margins so the entire wordmark fits a wide horizontal image with a little transparent breathing room. Preserve the supplied lettering, EXACT spelling OneGrid with uppercase O and G, original thin-and-thick letter geometry, dark charcoal/black letters and small RED accent over i, proportions and all shapes exactly. No recolouring, no restyling, no shadow, no added elements, no other text. Transparent PNG. All letters and red accent fully visible, no clipping.
```

## Earlier PNG delivery

These three PNGs were supplied directly by Rafael for the About partner cards. They were copied without modification, retaining their original pixels, aspect ratios and alpha transparency. SHA-256 comparisons confirmed each project asset is identical to the supplied file. No logo was regenerated or recoloured.

| Partner | Project asset | Original size | Supplied attachment |
| --- | --- | --- | --- |
| EHP Interiors | public/images/v2/partners/ehp-interiors-logo.png | 299 x 58 | codex-clipboard-9f39d7fe-7310-4dad-9848-68c4608ab9ca.png |
| One Grid | public/images/v2/partners/one-grid-logo.png | 4858 x 1000 | codex-clipboard-52902d02-f434-41a0-9c09-1075d2ee6d7c.png |
| IPDC | public/images/v2/partners/ipdc-logo.png | 1516 x 431 | codex-clipboard-984513d2-16e5-4803-96c2-c29a964305d1.png |

Each logo appears below its partner description. The white One Grid logo has a dark backing for contrast. Partner destinations and order are preserved. Hover tooltips follow the mouse above the pointer using Putt Brothers purple and yellow, with keyboard-focus support. Visual approval belongs to Rafael.

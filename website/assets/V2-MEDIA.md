# V2 scene media ledger

Created 1 October 2026 with the built-in image generation tool. No external stock-photo source or paid API fallback was used.

## Provenance and intended use

**AI concept imagery, not completed client projects.** These scenes visualize the direction supplied by Rafael. The workshop people are anonymous illustrative craftspeople, not portraits of Putt Brothers employees. Do not caption these as a documented installed venue, named customer case study, or actual factory photograph.

The user supplied flattened brand boards containing photography, headings, icons and logos. These new raster assets contain only clean scenes; all website headings, copy, logos, icons, links and controls must remain separate semantic HTML/SVG. Originals were retained unchanged; WebP files are intentionally cropped/encoded derivatives.

## Reference material

Reference boards in `../New Website/`:

- `WhatsApp Image 2026-10-01 at 5.42.44 AM (1).jpeg`: Custom mini golf, custom fit-outs and interactive experiences. Inspected with the image-viewing tool before generation.
- `WhatsApp Image 2026-10-01 at 5.42.45 AM (1).jpeg`: The people are the brand; design, engineering and manufacture reference, supplied in the conversation.
- `WhatsApp Image 2026-10-01 at 5.42.46 AM.jpeg`: palette and visual system reference, supplied in the conversation.

These are visual references, not image-edit targets. Four separate generation calls produced four separate scenes, not a collage. No supplied logo was regenerated. The generated originals were visually inspected, and all four portrait mobile derivatives were separately inspected; the focal activity remains visible.

## Files and responsive use

Originals: `assets/v2-originals/{scene}.png` (1672 × 941).
Browser assets: `public/images/v2/{scene}-{desktop,tablet,mobile}.webp`.

- Desktop: 1600 × 900, quality 82, wide architectural context.
- Tablet: 1000 × 750, quality 78, closer 4:3 framing.
- Mobile: 600 × 750, quality 72, deliberate central 4:5 crop preserving people and focal activity. These are lighter crops of each scene; the separate mobile hero is managed by the main implementation.

Use picture/source breakpoints so phones load the mobile file instead of downloading the desktop file. Avoid CSS background duplication. Lazy-load below-the-fold scenes and reserve image dimensions to reduce layout shifts.

| Scene | Desktop bytes | Tablet bytes | Mobile bytes | Mobile reduction vs desktop |
| --- | ---: | ---: | ---: | ---: |
| minigolf | 179152 | 89116 | 42240 | 76% |
| hospitality | 204396 | 98458 | 53926 | 74% |
| interactive | 131392 | 69302 | 36320 | 72% |
| workshop | 136300 | 69984 | 35052 | 74% |

Regenerate the WebP derivatives with `node scripts/optimize-v2-scenes.mjs`. This uses the already installed Next dependency's Sharp package and does not alter dependencies, source PNGs or V1 files.

## Existing team portrait conversions

The four existing, user-approved real-contact portraits were converted locally from `public/images/directors/` to WebP without image generation, retouching, identity alteration, new crops or enlargement. Each original PNG is unchanged. Sharp preserves the original aspect ratio and fits within 480 × 480 at quality 85. The About page uses these new files while retaining its existing display dimensions. The form and event-contact picker still use their original assets and were not changed.

| Contact | Original | New path under public/images/v2/team/ | Dimensions | Bytes |
| --- | --- | --- | --- | ---: |
| Douglas Tonsic | Douglas.png | douglas-tonsic.webp | 468 × 447 | 15038 |
| Imre Szenttornyay | Imre-Szenttornyay.png | imre-szenttornyay.webp | 480 × 480 | 34568 |
| João Nascimento | John.png | joao-nascimento.webp | 465 × 400 | 11662 |
| Luiz Tonsic | Eduardo.png | luiz-tonsic.webp | 480 × 429 | 11286 |

Combined portrait payload falls from 3,075,460 bytes to 72,554 bytes (97.6% smaller). Reproduce with `node scripts/optimize-v2-team.mjs`. These portraits are distinct from the AI concept scenes documented above; no new AI processing was applied to the people.

## Existing product-card conversions

The two existing product renderings used by the Products collections cards were converted to WebP at quality 85, preserving their original aspect ratios, composition and alpha channel. No AI processing, new imagery, crops or enlargement were applied. The original PNGs remain unchanged, as do the carousel, catalogue APIs and their image paths.

| Original under public/images/ | New path under public/images/v2/products/ | Dimensions | Bytes |
| --- | --- | --- | ---: |
| CourseHoles/THE_HOM_RUN.png | the-home-run.webp | 900 × 675 | 46124 |
| TableGolf/SOCCER.png | soccer-table-golf.webp | 900 × 600 | 43312 |

Both optimized assets are below 50 KB, so these two cards use a single 900-pixel-bounded WebP each, retaining the existing Next Image dimensions, fill and sizes behavior without adding a new picture component. Combined payload falls from 837,043 to 89,436 bytes (89.3% smaller). Reproduce with `node scripts/optimize-v2-product-cards.mjs`.

## Exact generation prompts

### minigolf

```text
Use case: photorealistic-natural
Asset type: responsive website feature image, landscape 16:9.
Primary request: a single clean cinematic scene inspired by the custom mini golf experience in the user-provided Putt Brothers brand boards, with all typography, branding and infographic elements absent.
Scene/backdrop: premium indoor social entertainment venue with a sculpted miniature golf hole, fresh green turf, curved dark timber edges, tropical planting, charcoal architecture and restrained purple accent lighting.
Subject: two adult friends playing miniature golf, one making a gentle putt with a correctly held putter and the other watching naturally. The actual course and experiential environment are the main subject.
Composition/framing: wide architectural lifestyle photograph, eye-level, a visually complete green and golfers clustered in the central half to support a narrower mobile crop, depth and atmosphere. A clear center focal point, no collage.
Lighting/mood: warm golden pendant lighting, subtle purple LED accents, sophisticated lively evening atmosphere.
Materials/textures: believable turf, timber, upholstery, foliage and natural skin/clothing.
Constraints: an illustrative venue concept, not an existing real project. No text, letters, numerals, signs, logos, brand marks, watermark, frame, diagram, floating graphic, or captions. Realistic human anatomy and golf equipment. High quality photorealistic editorial photography.
```

### hospitality

```text
Use case: photorealistic-natural
Asset type: responsive website feature image, landscape 16:9.
Primary request: a single clean cinematic premium bar-and-lounge fit-out scene inspired by the hospitality section of the user-provided Putt Brothers brand boards, with every text and graphic overlay removed.
Scene/backdrop: beautifully crafted hospitality interior adjoining a social entertainment venue; sculptural bar with dark fluted timber, warm illuminated shelves of unlabeled bottles, brass details, luxurious seating, lush plants and subtle deep-purple accents.
Subject: inviting finished architectural space with a few adult guests in the background naturally conversing, and one bartender behind the bar. Architecture is the focal point, not a crowded party.
Composition/framing: wide 16:9 professional interior photograph with central focal bar/seating grouping that also reads clearly in a narrow portrait crop; three-dimensional depth, no collage.
Lighting/mood: warm amber lighting, near-black architectural surfaces, refined purple accents and tiny yellow material accents, realistic and premium not oversaturated.
Materials/textures: real timber grain, leather, metal and glass reflections, naturally varied details.
Constraints: illustrative design concept, not a claimed completed real project. No text, typography, legible bottle labels, logos, signage, brand marks, watermark, border, or graphical overlays. Photorealistic editorial architectural photography.
```

### interactive

```text
Use case: photorealistic-natural
Asset type: responsive website feature image, landscape 16:9.
Primary request: a single clean cinematic interactive golf experience inspired by the digital-meets-physical environments in the user-provided Putt Brothers brand boards.
Scene/backdrop: premium golf simulator bay within a social entertainment venue, one large realistic projection screen showing a natural golf fairway and putting green without any text, numbers, interface, or logo. Dark padded walls, green turf hitting mat, seating beyond the bay.
Subject: one adult woman holding a golf club at rest on the turf, viewed three-quarter from behind, with a friend spectating comfortably beyond the swing safety area. Emphasize physical play integrated naturally with the bright immersive screen.
Composition/framing: wide architectural lifestyle photograph, subjects and simulator centered enough for portrait mobile crop. Visible realistic safe simulator scale, one connected scene, no collage.
Lighting/mood: warm indirect yellow lighting and elegant deep purple edge accents contrasted with natural green fairway projection; cinematic but plausible exposure.
Materials/textures: realistic turf, club, padded wall, natural skin and clothing texture.
Constraints: illustrative entertainment venue concept, not an actual documented client project. Absolutely no text, words, scoreboards, numerals, logos, watermarks, diagram elements, borders, or branding. Correct human anatomy and one realistic golf club per player.
```

### workshop

```text
Use case: photorealistic-natural
Asset type: responsive website process/About image, landscape 16:9.
Primary request: a single clean cinematic editorial photograph of design and craftsmanship behind an entertainment venue, inspired by the team and manufacture scenes of the user-provided Putt Brothers brand boards.
Scene/backdrop: bright high-quality design/manufacturing workshop, orderly workbenches, curved miniature golf course timber modules and architectural materials in the background.
Subject: two anonymous adult craftspeople collaboratively checking the smooth curved wooden edge of a custom mini-golf module at a workbench. One wears an unbranded black work polo and the other a yellow work polo. Real people at work, not posed as a named company employee or executive.
Composition/framing: wide 16:9 photo with the hands/workpiece and collaborative interaction in the central half for mobile cropping; eye-level, layered workshop depth, no collage.
Lighting/mood: beautiful natural workshop daylight mixed with warm task lighting, charcoal, timber and yellow palette; restrained purple only as a subtle environmental accent if natural.
Materials/textures: authentic wood grain, work clothing, safe workshop setup, real tools and nuanced material surfaces.
Constraints: illustrative craftsmanship concept, not a factual photo of the company's employees or factory. No logos, branding, letters, text, readable plans, signage, watermarks, borders or overlays. Realistic anatomy and practical body posture. No unsafe machine operation.
```

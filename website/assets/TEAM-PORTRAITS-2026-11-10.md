# About team update, 10 November 2026

Mode: built-in `image_gen`, background extraction and identity-preserving framing.
Original client photographs were preserved under `../../New Website/images/directors`.
The existing Douglas studio-v3 portrait was supplied only as a framing reference.
The original four-person provenance remains in TEAM-PORTRAITS.json.

## Saved assets

| Person | Original | Local PNG master (ignored by Git) | Web derivative |
| --- | --- | --- | --- |
| Imre Szenttornyay | Imre.jpeg | assets/v2-originals/imre-szenttornyay-studio-v4.png | public/images/v2/team/imre-szenttornyay-studio-v4.webp |
| Rubens Tonsic | Rubens Tonsic.jpeg | assets/v2-originals/rubens-tonsic-studio-v4.png | public/images/v2/team/rubens-tonsic-studio-v4.webp |

Both web derivatives are 640 x 640 WebP, quality 85, alpha quality 100, with real alpha transparency. The page retains the existing shared CSS background `linear-gradient(145deg, #eeede9, #d8d9d5)` and yellow bottom border. Rebuild derivatives from preserved PNG masters with `node scripts/prepare-team-v4.mjs`. Import from the generation outputs only with the explicit `--import-generated` flag.

## Exact prompts

### Imre

```text
Use case: identity-preserve / background-extraction. Edit target is FIRST image, Imre, the older man with grey beard wearing a blue check blazer over BLACK crew neck shirt. SECOND image is ONLY framing reference, not identity. Produce one square transparent PNG of Imre for a website director portrait. Remove the event banner/background completely, preserve original person's EXACT face, age, hair, beard, expression, blue check blazer and BLACK crew neck shirt; do not replace clothing, retouch/reinvent face or make him younger. Crop/reframe original into head and upper chest/shoulders, with entire head visible, hair top about 4% below square top and shoulders filling bottom edge like reference image. Alpha transparency around person, no background color/shadow, no text or logos. Preserve photographic identity and original pixels wherever possible; background extraction and square crop only.
```

### Rubens

```text
Use case: identity-preserve / background-extraction. Edit target is FIRST image, Rubens, smiling grey-haired man with grey beard wearing black zip jacket over light patterned button shirt. SECOND image is ONLY framing reference, not identity. Produce one square transparent PNG of Rubens for a website director portrait. Remove plain background completely, preserve original person's EXACT face, smile/teeth, age, hair, beard, expression, black zip jacket and light shirt; do not replace clothing, retouch/reinvent face or make him younger. Reframe original into head and upper chest/shoulders, with entire head visible, hair top about 4% below square top and shoulders filling bottom edge like reference image. Alpha transparency around person, no background color/shadow, no text or logos. Preserve photographic identity and original pixels wherever possible; background extraction and square framing only.
```

## Content and publication state

Team order: Luiz Tonsic, Douglas Tonsic, João Nascimento, Rubens Tonsic, Imre Szenttornyay. Existing full names preserved. Rubens: CTO, Chief Technical Officer. Imre: Board Member. Five desktop columns, two tablet columns, one mobile column.

Partner order: EHP Interiors, One Grid, IPDC. Each whole card links to its official site. IPDC description was checked against https://ipdc.co.nz/ and the local IPDC brand voice reference. Existing EHP and One Grid descriptions were preserved.

The protected local preview build and all 70 existing tests passed. Targeted ESLint passed. Dev publication was attempted using scripts/deploy-preview.mjs --publish and stopped before deployment by the existing clean-Git guard: `Commit and review the changes before publication`. The workspace already contains the earlier source reorganization and platform implementation as uncommitted changes. They were preserved; no commit/push, production publication or form submission was performed in this update. Visual approval belongs to Rafael.

The general `tsc --noEmit` check reports two existing CacheStorage.default typing errors in worker.ts, lines 176 and 208. That Worker is unchanged, verified against HEAD by identical Git blob hashes. The Vinext preview build succeeds.

Functional DOM checks confirmed the five directors in the requested order on one desktop row, all portrait images loaded, correct partner destinations/new-tab attributes, and no horizontal overflow at desktop 1360 x 900 and 1360 x 768. Mobile and tablet column behavior was also checked through computed layout. No screenshots or visual approval were performed. Local review URL: http://127.0.0.1:8792/about.

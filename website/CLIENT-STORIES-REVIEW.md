# Real play carousel, 13 October 2026

## Addition authorized on 16 November 2026

Rafael supplied three Instagram MP4 files and requested publication on both Dev and official. They are appended after the original six films, giving nine films in total: The putting challenge, Mini golf for venues and Your next attraction. Original downloaded files are preserved in Downloads.

The new web copies are `public/videos/client-story-*-instagram-v1.mp4`, with WebP posters at `public/images/v2/client-story-*-instagram-v1.webp`. They use 720x1280 H.264, 30 fps and faststart. The complete source content and original AAC audio are retained; preparation checks matching compressed audio stream hashes and a maximum 150 ms container-duration difference. No replacement soundtrack or assumed Mixkit license is attached to these supplied clips.

`scripts/prepare-instagram-stories.mjs` prepares only the three new files and refuses overwrites. `--verify` validates source/output hashes, original audio and manifest sizes without rewriting media. `assets/client-stories-web.json` records their provenance separately from the original six soundtrack records. The video byte-size map includes the new files for Worker range serving.

The counter derives its total from the story list. Mobile selectors wrap into two rows with at least 44px targets. The one-player, muted playback, offscreen pause, sound toggle and optional auto-next behavior remain in place. New video accessibility labels describe original audio rather than assuming instrumental music without speech.

The three MP4 derivatives total 14,360,618 bytes versus 19,913,962 source bytes, a 27.9% reduction. Their three WebP posters total 176,968 bytes. Local manifest/audio verification and all five carousel/media tests passed before publication.

The sections below record the original six-film delivery and its verification at that time.

## Scope

- Home: six approved films after What we create, before the turnkey section.
- Depth-style stage inspired by Rafael's selected [DepthCarousel reference](https://www.reactbits.dev/components/depth-carousel), implemented locally without a new dependency or WebGL. Reuses the existing BorderGlowPanel and brand tokens.
- One video element at a time. Other slides are lightweight WebP previews.
- Muted autoplay when sufficiently in view; optional sound; pause offscreen or on hidden tabs; manual pause retained; previous/next, keyboard arrows, selectors, horizontal swipe and optional advance after completion.
- Reduced-motion and data-saving preferences use manual playback. No wheel interception. Video files load only when the section is approached and playback preferences allow it.
- Original approved cuts, captions and individual audio tracks preserved. No public venue names added. No new music credits over the videos.
- Removed the duplicate concept-imagery sentence below the experience cards. Footer disclosure unchanged.
- Smaller Top button: approximately 69 by 32 CSS pixels with text, reduced padding/icon/type size and shadow.

## Media

Masters remain in `../New Website/videos/client-stories-v01/exports/trilhas-individuais-v03`.
Web copies are `public/videos/client-story-*-v3.mp4`; posters are `public/images/v2/client-story-*-v3.webp`.
MP4: 720x1280, 30 fps, H.264 faststart, 4.22 to 8.09 MB each.
Posters: 540x960, 29 to 61 KB. Audio is stream-copied, with matching stream hashes checked during preparation.
`assets/client-stories-web.json` records source/output hashes, approved soundtrack provenance and sizes.
`scripts/prepare-client-stories.mjs` can reproduce derivatives but refuses to overwrite existing files.

## Technical verification

- 34 unit/contract/media tests pass, including the original contact and preview-isolation tests.
- Vinext production build passes. Full TypeScript check retains only the three pre-existing Workers CacheStorage.default errors in worker.ts (157, 201, 233); no new component errors.
- Chrome: single active player, manual play, switching pauses old media, explicit sound toggle, offscreen pause and persistent manual pause confirmed.
- Normal-motion autoplay and automatic advance verified in an isolated test context; reduced-motion default uses manual playback without loading a video source until requested.
- Keyboard navigation confirmed. No horizontal document overflow at 1360x900, 1366x768, 768x1024 and 390x844; mobile stage keeps native vertical panning.
- One development-only Radix ID hydration warning appeared during a reloaded development session. Contact source remains untouched; production browser verification is recorded with the release.
- Footer, contact, planner, APIs, dependencies, production Worker and V1 remain unchanged.

Visual approval is pending Rafael. No screenshots or autonomous visual approval were performed. Check desktop/tablet/mobile layout, swipe, controls and sound on the published preview.

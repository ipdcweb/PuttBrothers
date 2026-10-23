# V2 client review release

## Current baseline, synchronized with official on 23 October 2026

Rafael approved the official site and authorized updating this preview for future
improvements. Preview source `1af8fe3`, version
`e39bca17-fb7d-46a2-bcd4-7fdf88183947`, includes the official marketing/header,
planner illustration, always-on scroll and contact feedback/reset improvements.
All 60 tests, the build and public/browser checks passed. Form/PDF writes remain
blocked, review buckets and noindex remain isolated, and the preview notice is
retained. The official deployment was confirmed unchanged at version
`2781ce5f-a326-41a9-97e6-d52ae30c7165` before/after this publication.
See `MARKETING-REVIEW-20261023.md` for source parity and verification details.
The records below describe earlier preview releases.

Date: 12 October 2026.

## Authorized scope

Rafael authorized GitHub publication and a temporary hosting preview, then chose
the hosting URL instead of a custom domain. Branch name: `website-v2`.

| Version | Source | Hosting |
| --- | --- | --- |
| V1 | `main`, stable tag `v1.0.0-2026-10-01` | Existing `puttbrothers-com`, production domains unchanged |
| V2 | `website-v2` | Separate `puttbrothers-v2-preview`, temporary workers.dev URL |
| Future V3 | Create `website-v3` only when requested | Separate preview before any deliberate production promotion |

Changing a Git branch does not change the live website. Promotion requires an
approved build/deployment. Keep version tags and Cloudflare deployment IDs so a
previous code/assets release can be restored without deleting later work.

## Production baseline before this publication

- GitHub `main`: `30bccc445d63a70344674a6d9fddd7785488d9ce`.
- Cloudflare active production version: `7193bac3-40e3-4d83-b8f3-006e6bdcb91a`.
- V1 has unrelated local edits in `components/app-section.tsx` and
  `components/footer.tsx`. They were not modified or included in V2.
- No GitHub Actions workflows were listed for this repository.

## Preview safeguards

- No production routes or custom DNS changes.
- No copying of production credentials or bindings.
- Worker blocks contact submissions and PDF uploads before integration handlers.
- Visible preview notice, noindex metadata/headers and robots.txt.
- Public review link, not a password-protected staging environment.
- Original production media stays local. Only website derivatives are deployed.
- `deploy:preview` checks branch/repository/pushed commit/configuration, tests,
  builds and rechecks the generated configuration before publishing.

## Publication evidence

- Public review URL: https://puttbrothers-v2-preview.team-web-592.workers.dev
- GitHub branch: https://github.com/ipdcweb/PuttBrothers/tree/website-v2
- Deployed source: `035c3b3eb88650edd79d81e1793a3137fed6da8a`.
- Cloudflare version: `f1efcfa3-ec79-4251-b7b8-64e97cab3556`, 100% traffic.
- Deployment: `9c7bcb80-2fc5-4579-bc58-cc8f42cb9e9b`,
  `2026-10-12T13:05:18.585198Z`.
- 29 unit/contract/isolation/range tests passed; Vinext production build passed.
- `node scripts/check-preview.mjs` passed online at
  `2026-10-12T13:06:28.835Z`: five HTML routes, catalog APIs (39 products and
  30 planner items), both MP4 variants, four WebP portraits, 2026 PDF, robots.txt,
  noindex headers and 403 write protection on contact/PDF endpoints.
- Empty JSON requests only were used to verify blocked writes. No real leads or
  PDF uploads were sent.
- Chrome confirmed Home/About/Products navigation, product pagination from 1-12
  to 13-24 of 39, video metadata (28.125 seconds) and forward/reverse scroll seeking.
- Production version was checked again after this release and remains
  `7193bac3-40e3-4d83-b8f3-006e6bdcb91a`. `main` remains the baseline commit.
- Documentation-only commits after the source SHA above do not change the live
  application. The exact deployed version is recorded here for reproducibility.

### Hosting compatibility fixed during verification

The initial preview returned HTTP 200/full MP4 files for Range requests. The
isolated Worker now handles only `/videos/*` before static serving and streams
the requested byte slice as HTTP 206. It handles open-ended/suffix ranges,
unsatisfiable ranges and If-Range without buffering an entire video in memory.
The deployed asset binding omits Content-Length, so the verified source-size
manifest in `lib/scroll-video-files.json` supplies it. The deploy guard refuses
publication if those sizes differ from the actual public files; the media
preparation script regenerates this manifest when encoding new derivatives.

Cloudflare intermittently returned 504 errors during publication. The guarded
command now retries only transient 502/503/504 failures, up to three attempts,
using the same validated build. Final success was confirmed by the active
deployment record and the remote checks above, not merely by a CLI attempt.

## Review

Technical tests do not constitute visual approval. Rafael/client review is still
required for desktop/mobile composition, scrolling rhythm and final sales copy.

## Update, 13 October 2026: real-play films

- Rafael authorized updating this same temporary URL. No production or DNS changes.
- Source: `1afb2e4`, branch `website-v2`.
- Cloudflare version: `ff0eca5c-545b-4e73-b993-fee532bcff8e`.
- Published through the guarded `deploy:preview` workflow: 34 tests and the final Vinext build passed.
- Six-film depth carousel added to Home, with individual approved soundtracks, one active player and lightweight WebP previews. See `CLIENT-STORIES-REVIEW.md`.
- Duplicate concept-imagery sentence removed from the experience section; footer disclosure retained. Top button reduced to approximately 69x32 CSS pixels.
- Remote check passed at `2026-10-13T10:43:42.430Z`: all five HTML routes, catalogue APIs, both hero MP4s, six new MP4 range requests, six new WebP posters, portraits, PDF, noindex and blocked preview writes.
- Published Chrome session confirmed six selectors, one video element, successful muted playback, the smaller Top button and removal of the duplicate sentence. No hydration/runtime error was reported; one existing-style preload warning concerned unused `v2-pages` CSS.
- Final preview opened in Chrome at `/#real-play` for Rafael's visual approval. No screenshots were taken. These documentation-only changes do not alter the deployed source above.


## Update, 23 October 2026: Cloudflare product media migration

- Rafael requested analysis, a plan and implementation to remove AWS from the
  product carousel, catalogue and interactive 3D viewer.
- Deployed source: `0f7ef8d`, branch `website-v2`.
- Cloudflare version: `b5d5fb48-571f-4393-b5e7-04a981bb3a00`.
- Same authorized URL: https://puttbrothers-v2-preview.team-web-592.workers.dev/products
- Private R2 bucket `puttbrothers-product-media-review`, binding `PRODUCT_MEDIA`,
  immutable release prefix `catalog-20261023-v1`. All 198 objects (409,833,999 bytes)
  were downloaded back from R2 and verified by complete SHA-256, size and MIME.
- Complete 39-machine catalogue now bundled with the Worker. Planner retains
  the same 30 machine IDs/dimensions; images and all 10 original Unity builds
  are served on the same origin. No runtime S3/Lambda fallback for this scope.
- Guarded publication passed 47 tests and the final Vinext build. New guard
  requires verified upload receipts before publication.
- General online preview check passed at `2026-10-22T19:39:30.079Z`; five routes,
  existing media/catalogue checks, noindex and blocked contact/PDF writes.
- Product migration online check passed at `2026-10-22T19:40:52.069Z`: 198 media
  paths, HEAD/MIME, ranges for large files, full hashes for small files,
  catalogue counts/source, legacy planner image URL and unsafe-host rejection.
- Cloudflare omits Content-Length and ETag for Unity HTML at the edge; full HTML
  GET still exactly matched its original SHA-256. The checker accounts for this
  transport behavior. JavaScript/WASM/data/image headers retain their validators.
- Chrome initialized all 10 Unity models on the public preview (loading indicator
  hidden, fullscreen callback installed, no error banner, no AWS asset request).
  Carousel button opened Rack'Em Up in the modal; close and pagination worked.
- Desktop 1360x900 and mobile emulation 390x844: image decoding and pagination
  work without horizontal document overflow. Planner image export response was
  decoded by Chrome (300x198) with 30 catalogue items. No real form/PDF upload.
- Existing Unity persistence/WebGL warnings remain nonfatal. Visual approval,
  including rotation/zoom on Rafael's actual devices, is pending.
- V1, production, DNS, AWS source assets and the separate PDF-upload integration
  remain preserved. This is not authorization to close the AWS account.
- Source and implementation plan: `CLOUDFLARE-PRODUCT-MIGRATION.md`.
- Documentation/checker-only commits after the deployed source do not change the
  running Worker. No production deployment occurred.


## Update, 23 October 2026: remaining AWS PDF dependency removed

- Rafael requested complete AWS retirement, then directed publication to the
  existing V2 preview so he can review before stopping AWS.
- Deployed source `2f78bc9`; Cloudflare version
  `9311c4a5-95b3-4a9e-9795-94501f6f6ebb`.
- Same URL: https://puttbrothers-v2-preview.team-web-592.workers.dev/
- Native private R2 PDF upload/download replaces the last AWS SDK route.
  The SDK and 47 unused packages were removed; other versions are unchanged.
- 56 tests and guarded final Vinext build passed. Native local R2 and rate-limit
  test confirmed an identical synthetic PDF through upload/download/HEAD/Range.
  Chrome's PDF viewer initialized one page and normal controls under the headers.
- Public general check passed at `2026-10-22T20:17:49.118Z`; 198-media check passed
  at `2026-10-22T20:17:51.907Z`. Chrome confirmed catalogue source Cloudflare,
  39 machines, 10 3D entries and no AWS request in the checked preview session.
- Preview contact/PDF writes remain blocked. No real lead or customer PDF sent.
- V1 backend-only cutover is prepared on branch `aws-retirement-production` in
  `WebsiteLocal_AwsRetirement`; it is NOT promoted to production. An isolated
  validation Worker was published without routes, version
  `4ebcb2f5-58cb-4a9b-9053-4a1980bd4e31`. This is not the requested V2 review link.
- Latest sequencing from Rafael: review the V2 preview first, then decide the
  AWS stop/cutover. Production, DNS, AWS resources and credentials remain intact.
- AWS console session provided by Rafael was read and identified account
  `590183868691` (ipdc Limited). MFA/settings were not changed. Object inventory
  and historical PDF/link migration still precede resource deletion.
- See `AWS-RETIREMENT.md` for the account retirement and historical-link boundary.

## Update, 23 October 2026: remove duplicate carousel arrows

- Rafael confirmed the preview's images and interactive 3D viewer work. He
  requested removing the rectangular carousel arrows and keeping the circular
  previous/next group buttons beside the product count, on this same preview.
- Removed the internal Swiper Navigation controls, their module import and
  exclusive CSS. Swipe, autoplay, dots and 3D handling remain available.
- Repeated browser clicks also revealed an existing group-pagination issue:
  Swiper's initialization/loop reordering emitted physical-index changes that
  could undo a group change. Group boundary handling now observes logical product
  index changes only after initialization, keeping the circular controls stable.
  No dependency or new unit test was added; the actual browser flow is verified.
- This correction remains preview-only. AWS inventory/shutdown and production
  cutover remain separate following the agreed review sequence.
- Final deployed source: `5543d50`; Cloudflare version
  `02bf7a6b-ec7b-4612-98ca-95ae9b579820`. The guarded deployment passed all
  56 tests and the final Vinext build. Targeted lint had zero errors and four
  pre-existing warnings (loose product types and unused video state).
- Chrome DOM/function checks passed at 1360x900 and 390x844: exactly two circular
  group controls, no rectangular arrows, all four desktop/five mobile groups
  traversed forwards/backwards, correct count/disabled boundary states, decoded
  active images and no horizontal document overflow or console errors.
- Desktop loop boundary handling also passed using Swiper's public slide methods:
  backwards from group two's first item selects group one's last item; forwards
  returns to group two's first item without reversing the group change.
- Public preview smoke check passed at `2026-10-22T20:40:34.052Z`, including all
  five routes and blocked preview writes. Final Products page is opened for
  Rafael's visual review. Documentation-only commits do not change this deployment.

## Update, 23 October 2026: individual product navigation and lightweight WebP

- Rafael reported the mobile carousel stopped at `33-39 / 39`. Reproduced:
  those controls selected groups of eight, so Next disabled on product 33 while
  six products remained accessible only by swiping. The previous group checks
  passed that behavior but did not cover the intended individual-image flow.
- Removed group slicing/remounting and its boundary callbacks. One Swiper now
  holds the complete 39-product catalogue; both circular arrows and swipe share
  the same individual index, displayed as `1 / 39`. Rewind continues from 39 to 1
  and from 1 to 39 without rearranging the DOM. No extra arrow controls were added.
- Mobile originals already measured 299-300 px but were PNG. Added 39 transparent
  WebP derivatives at exactly 300 px, 7,614-16,328 bytes each: 384,242 bytes total,
  56.22% smaller. Desktop uses 39 WebP derivatives at 720 px: 1,711,278 bytes,
  80.40% smaller. Original PNGs remain available for detail and planner use.
- A responsive picture selects mobile WebP before hydration, avoiding a desktop
  PNG download on mobile. Images use lazy/async decoding and only the visible
  card/neighbours receive the expensive glow. Dynamic bullets stay compact.
- Autoplay starts only after the desktop breakpoint is known. A lifecycle effect
  explicitly stops it on mobile and while a detail/3D modal is open, and handles
  resizing without remounting the carousel. Manual arrow clicks pause playback.
- `scripts/prepare-carousel-images.mjs` reproduces the derivatives from verified
  source hashes. `--verify` checks all 78 deployed derivatives offline; the preview
  deployment guard now requires it. See `assets/carousel-images-manifest.json`.
- Local Chrome checks at 390x844 with 4x CPU slowdown: no automatic movement for
  3.5 seconds, mobile WebP decoded at 300 px, no original PNG request, 40 forward
  and 40 backward clicks reached all 39 product folders with correct titles/counts,
  successful wraparound and the same Swiper instance. No console error/overflow.
- Resizing to 1360x900 preserved the current product, selected WebP at 720 px and
  enabled desktop autoplay, which advanced one product. Targeted component lint
  passed; typecheck has only the two previously documented CacheStorage.default
  errors in worker.ts. No dependency, production, DNS or AWS resource was changed.
- Published source: `d28307b`; Cloudflare version
  `22b5b665-be05-4faf-b0fb-8fe036fbef25`. The guarded deployment passed all
  56 tests, the 78-derivative verification and the final Vinext build.
- Online verification passed for all 78 WebP at `2026-10-22T21:29:59.291Z`:
  HTTP 200, image/webp, complete SHA-256, bytes, dimensions and alpha. Evidence:
  `tmp/check-published-carousel-images.json`. General preview checks passed at
  `2026-10-22T21:29:50.672Z`, including blocked contact/PDF writes.
- Published Chrome mobile check (390x844, CPU 4x) passed 40 forward and 40 backward
  clicks across all 39 folders. Bridge advanced to Bulls Eye, Super Bowl wrapped
  to Bowling, both buttons remained usable, count and active product agreed, and
  the same Swiper instance persisted. No desktop carousel derivative or original
  PNG was requested on mobile; autoplay stayed off. No console error or overflow.
- Published desktop decoded 720px WebP. A controlled autoplay interval advanced
  from index 4 to 5 after 3.2 seconds. The unchanged Rack'Em Up 3D URL opened in
  the modal; autoplay stopped while open and closing removed the iframe.
- Final review URL: https://puttbrothers-v2-preview.team-web-592.workers.dev/products?review=carousel-webp-300
  Opened in Chrome for Rafael's visual/touch review. Local test server was stopped;
  subsequent documentation commits do not alter the deployed source above.

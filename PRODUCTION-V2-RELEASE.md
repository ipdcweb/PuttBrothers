# Approved V2 production promotion

Date: 23 October 2026, Australia/Brisbane. Rafael explicitly requested making
the current V2 preview official, keeping a separate preview for future work,
and retiring AWS services afterward. This release performs the website promotion
only; AWS inventory/removal is coordinated separately.

## Source and deployment identity

- Approved preview baseline: `8e759f3c3cd4e0dcd8226775e31145890ffe236d`.
- Production worktree: `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal_V2Production`.
- Production branch: `website-v2-production`, repository `ipdcweb/PuttBrothers`.
- Official Worker: `puttbrothers-com`, account `5929fdac0cd2d82d7378551cf4c20774`.
- Existing eight routes for apex/www of `.com`, `.ch`, `.de`, `.uk` remain intact.
  The seven aliases redirect to the canonical `https://puttbrothers.com`.
- Previous official Worker version / AWS-independent rollback:
  `62af4949-e440-4891-ad43-819665e83830` (V1 interface, Cloudflare backend).

## Preserved implementation

The approved Home, scrolling hero, six client-story videos, About, Contact,
header/footer and 39-item product carousel are copied from the exact approved
preview commit. The 78 transparent WebP derivatives remain 300px mobile and
720px desktop. Original detail/planner PNGs and ten Unity builds remain in R2.
Contact/WorkOrg, full-name `FindLead`, picker and planner behavior are preserved.
The carousel autoplay prop object is assigned to a named variable, with exactly
the same values, to satisfy Swiper's TypeScript declaration without a runtime
change. The coordinating task mirrors this correction in the preview source.

Production differs in deployment configuration and SEO only: native R2 bindings
point to `puttbrothers-product-media-production` and
`puttbrothers-layout-pdfs-production`, limiter namespace `2026102302`,
`PREVIEW_MODE=false`, indexing/follow enabled, canonical metadata base set to
the official domain, and global preview-only noindex headers removed. Existing
asset cache headers and Worker video Range handling remain intact.

The guard checks exact branch/repository/account/clean pushed source, routes,
storage/limiter settings, video sizes, 78 WebP hashes/dimensions/alpha, all tests,
a fresh Vinext build and 198 verified production-media receipts. It uses
`--keep-vars` to preserve existing credentials and does not edit DNS.

## Separate preview and future maintenance

The original `WebsiteLocal_02` / `website-v2` preview remains unchanged, served
by `puttbrothers-v2-preview`, using review R2 buckets, no domain routes,
`PREVIEW_MODE=true`, noindex and blocked contact/PDF writes. Make future changes
and obtain approval there, then deliberately promote reviewed commits to this
production branch/worktree with the production guard. Switching branches alone
does not publish a website. Preview scripts retain their branch/account guard.

## Verification and publication

- Published code: `f99da081dedcd232b682760553c20f0a8983c62f`, on the clean pushed
  `website-v2-production` branch. The guard verified 78 WebP derivatives and all
  198 production-media receipts, then passed 56 tests and a fresh Vinext build.
- Official Worker active at 100%:
  `33587fb3-21dd-4055-80fc-f4ca72406f87`, created 23 October 2026 at 08:11:13
  Brisbane (22 October at 22:11:13 UTC). Startup time: 14 ms.
- Cloudflare metadata confirms both production R2 bindings, rate limiter namespace
  `2026102302`, `PREVIEW_MODE=false` and all six previous secret names, including
  `WORKORG_API_TOKEN`. No credential value was copied or printed.
- Public verification passed for five HTML pages with HTTP 200/no-store,
  `index, follow` metadata and no global noindex header. `robots.txt` allows
  crawling. Home contains the approved scrolling hero and client-story section.
- Catalogue returns all 39 products and planner all 30 machines from Cloudflare.
  All 78 public carousel WebP match source bytes/SHA-256; all 198 R2 media HEAD
  routes have the expected MIME/bytes/ETag, all ten Unity entrypoint hashes match,
  and all twenty WASM/data range checks return HTTP 206. The official CDN's
  optional compression is bypassed for byte/ETag checks with identity encoding.
- Both hero videos and all six client-story videos pass HTTP 206 seeking checks;
  six posters, four team portraits and the catalogue PDF return HTTP 200. All
  seven aliases preserve path/query in HTTP 301 redirects to the canonical host.
- Official PDF GET returns HTTP 405, and empty JSON POST returns HTTP 400 without
  a file/write. Empty JSON at contact returns the existing unsuccessful HTTP 500
  before constructing the external request. No valid PDF or lead was submitted.
- The existing preview independently passes its full check: noindex headers and
  metadata remain, robots disallows crawling, both form/PDF POST requests with
  empty JSON are blocked with HTTP 403, and media/video reads remain functional.
- Type checking now has only the two pre-existing `CacheStorage.default` errors
  in `worker.ts`; naming the autoplay options object resolves the inherited
  Swiper excess-property error without changing behavior.
- Local evidence (ignored): `tmp/production-release.log`,
  `tmp/check-v2-production.json`, `tmp/check-invalid-apis.json` and
  `tmp/check-preview-unchanged.json`. Browser interaction checks are coordinated
  separately. Technical checks do not replace Rafael's visual approval.
- AWS services, existing secrets and DNS were not changed by this worktree.
  The original V1 and V2 preview working directories remain preserved.

Rollback with the recorded version restores the previous V1 interface with the
Cloudflare backend, while RDS remains stopped. It does not restore deleted AWS
data or alter DNS. Confirm the active version and bindings before any rollback.

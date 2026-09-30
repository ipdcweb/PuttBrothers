# Putt Brothers — incident and performance validation

Date: 1 October 2026 (Australia/Brisbane).
Canonical source: `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal`.
Worker: `puttbrothers-com`.

## Confirmed incident

The canonical `https://puttbrothers.com/` returned HTTP 301 with an identical
Location. Chrome reproduced `ERR_TOO_MANY_REDIRECTS`. Response headers showed a
Cloudflare cache HIT, while the same page with a new query string returned 200.

`wrangler.jsonc` enabled Workers Cache, whose default cache key does not include
hostname. Alias redirects therefore populated the same key used by the canonical
website. This was distinct from the manually managed Cache API, whose keys include
the entire URL. This explains why the failure depended on which domain was visited
first and which cached response was present.

Reference: https://developers.cloudflare.com/workers/cache/cache-keys/

All eight apex/www names had Cloudflare A/AAAA and nameservers, valid TLS 1.3
connections, and certificates valid through 17 December 2026. The different name
`putbrothers.com` (one t) returned NXDOMAIN. No DNS or mail records were changed.

## Changes

- Disabled hostname-agnostic Workers Cache and removed its Vinext CDN adapter.
- Kept URL-keyed product/media Cache API and static asset caching.
- Added no-store to alias redirects and HTML responses.
- Added a six-second deadline and safe error response for S3 image requests.
- Added a six-second deadline to the browser catalog fetch; server JSON retrieval
  has a 3.5-second deadline including the response body.
- Render four real product designs immediately, then update from the live catalog.
- Corrected fallback schema and prevent fallback catalog responses from being cached.
- Versioned the explicit catalog cache key to bypass legacy fallback entries.
- Added `/?refresh=20261001` as a one-time recovery link. It sends
  `Clear-Site-Data: "cache"`, without requesting deletion of cookies or storage.
  Normal visits do not clear cache. A browser already holding the old permanent
  redirect recovered after visiting this link, then opened `/` normally.

Files changed this task: `worker.ts`, `wrangler.jsonc`, `vite.config.ts`,
`app/actions/products_db.js`, `app/actions/machines_with_flags.ts`,
`app/api/products/machines/route.ts`, `components/products-showcase.tsx`,
`lib/products-catalog.ts`, `tests/worker-routing.test.mjs`, this report.
Existing unrelated local changes were preserved; no commit or push.

## Verification

- Production build passed twice; final build completed successfully.
- Seven Worker regression tests pass (`node --test tests/worker-routing.test.mjs`).
- Catalog failure tests passed: upstream 503, empty array, invalid schema, JSON body
  timeout (3,506 ms). Valid 39-product response preserves the public array contract.
- Targeted lint: zero errors; six existing warnings.
- Cloudflare remote preview at `http://127.0.0.1:8790` verified visually at desktop
  and 390px mobile; carousel, navigation, mobile menu, and contact interface worked.
- Final production checked in a clean browser and a browser with the cached failure.
  No application console errors, broken images, HTTP resource errors, or horizontal overflow.
- All seven aliases tested before/after the canonical page, at `/` and
  `/contact?source=diagnostic`: exactly one redirect, correct path/query, final 200.
  Fourteen redirects carried no-store. Repeated canonical requests remained 200.
- No valid form was submitted. An empty-body POST attempt in the preview was blocked
  by automatic approval review due to possible external effects; verification used
  interface and source inspection instead. The WorkOrg endpoint and credentials
  were not changed, and delivery of an actual message was not retested.

## Observed performance (laboratory, not real-user percentiles)

| Measurement | Result | Conditions |
| --- | --- | --- |
| Canonical initial response, repeated requests | 83–103 ms | Public HTTPS, Brisbane edge |
| Alias + final homepage HTML | 137–212 ms | One redirect |
| Desktop LCP | 857 ms | Repeat navigation, no throttle |
| Desktop CLS | 0.01 | Same trace |
| Mobile LCP | 1,935 ms | Repeat navigation, Fast 4G, CPU 4x, 390px |
| Mobile first-visit LCP | 3,096 ms | Fresh isolated browser, Fast 4G, CPU 4x, 390px |
| Mobile first-visit TTFB | 78 ms | Same fresh navigation |
| Mobile CLS | 0.00 | Both mobile runs |

The initial-page failure is resolved. Fresh mobile visits on the simulated slower
device still take longer than repeat visits; these figures are not a guarantee for
all devices/networks. Catalog loading cannot leave an indefinite empty spinner.

## Deployment and recovery

- Previous incident version: `9d45d2eb-5611-4f69-9e30-438c6659884c`.
- Validated incident fix: `faa62547-1ca8-4260-9ec4-7152efc4a67a`.
- Final active version (100%): `c288ec73-3124-455f-8534-3f6ef0c14123`.
- Final message: `Keep HTML fresh and recover browsers with cached self-redirects`.
- Safe rollback for the optional recovery-header change is the validated incident-fix
  version `faa62547-1ca8-4260-9ec4-7152efc4a67a`. Do not blindly restore the previous
  incident version: it reintroduces hostname-agnostic caching and the redirect loop.
- Secrets preserved through `--keep-vars`; names verified before upload: AWS_ACCESS_KEY_ID,
  AWS_REGION, AWS_SECRET_ACCESS_KEY, LAYOUT_PDF_BUCKET, LAYOUT_PDF_PUBLIC_BASE_URL,
  WORKORG_API_TOKEN. Values were not displayed or changed.

Residual unrelated maintenance item: the existing 3D availability manifest is a
fixed list unless the upstream API supplies `has3D`. New 3D builds still need that
manifest updated. No live 3D checks were reintroduced into homepage loading.

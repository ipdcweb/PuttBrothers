# V2 client review release

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

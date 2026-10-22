# Putt Brothers website - V2 review workspace

Local redesign implemented on 1 October 2026 from the stable V1. The new Home,
Products, About, Contact surrounds, header and footer follow the supplied brand
direction. The approved contact form and integration source remain unchanged.

## Locations and version control

- V2: `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal_02`
- V2 branch: `website-v2`
- V1 remains in `../WebsiteLocal` on `main`.
- Common repository: `https://github.com/ipdcweb/PuttBrothers`
- Starting tag: `v1.0.0-2026-10-01`
- Starting commit: `30bccc445d63a70344674a6d9fddd7785488d9ce`

This is a Git worktree: source files are separate physical copies, while Git
history is shared. Editing a file here does not edit the corresponding V1 file.
The `.git` file links to the original repository metadata; do not delete/move
either working directory or copy that file to make another checkout manually.
Rafael authorized pushing V2 and publishing a temporary Cloudflare hosting link
on 12 October 2026. No custom domain or DNS change is included. See
[PREVIEW-RELEASE.md](PREVIEW-RELEASE.md) for the actual publication record.

## Run locally

Use Node.js 24.18.0 and the pinned pnpm 11.19.0. Keep `pnpm-lock.yaml` unchanged
unless a dependency change is explicitly needed.

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm run build:vinext
pnpm run start:vinext
```

The compiled V2 preview runs at `http://127.0.0.1:8792`. For live code editing,
use `pnpm run dev:vinext` on port 3002. These ports differ from V1, including
the browser origin/local-storage space used by the layout planner.
Use Vinext, not the generic Next.js scripts, to include the custom media Worker.

## Isolation and safety

- Worker configuration is named `puttbrothers-v2-preview`, with no domain
  routes, an authorized workers.dev endpoint, and no version-preview URLs enabled.
- `pnpm run deploy:vinext` remains blocked. The authorized command is
  `pnpm run deploy:preview`; it checks the branch, pushed commit and isolated
  configuration, then tests, rebuilds, rechecks the generated config and deploys.
- Product media uses the dedicated private `puttbrothers-product-media-review` R2
  bucket through the `PRODUCT_MEDIA` binding. The public Worker exposes only
  manifest-listed read requests; no media write endpoint exists.
- This folder has its own installed dependencies and generated build. V1 build
  output, `.wrangler` state and local secret files were not copied.
- Integration source is preserved, but production credentials were not copied.
  Do not submit real contact forms or upload PDFs during local testing. Credentials
  inherited from the machine could still permit external writes; local development
  is not an automatic network sandbox. Use mocked tests instead.
- Preview publication touches only the separate V2 Worker and `website-v2` branch.
  `PREVIEW_MODE=true` blocks contact/PDF writes before the unchanged handlers run.
  Production source, main, production Worker, DNS and secrets remain untouched.

## Implemented scope and review

Read [V2-PLAN.md](V2-PLAN.md) for the page map, brand-source interpretation and
preserved components. [V2-VERIFICATION.md](V2-VERIFICATION.md) records technical
checks and remaining review items. Visual/client approval is still pending.

All new scenes are responsive WebP assets, with separate desktop/tablet/mobile
sources and a newly composed portrait hero. Text, icons and navigation are real
HTML, not baked into the artwork. Generated scenes are labelled as concepts, not
completed client projects. Existing approved logos and real team portraits are
preserved. Prompts/provenance are in [assets/HERO-MEDIA.md](assets/HERO-MEDIA.md)
and [assets/V2-MEDIA.md](assets/V2-MEDIA.md).

The carousel lives on Products. The 23 October migration bundles the complete
catalogue and serves original images/Unity builds through private Cloudflare R2,
with the same pagination and 3D controls. See
[CLOUDFLARE-PRODUCT-MIGRATION.md](CLOUDFLARE-PRODUCT-MIGRATION.md).
The form and `FindLead` contract remain unchanged. The planner retains its IDs,
dimensions and layout behavior, with migrated catalogue/image sources.
No live form submission was made during local verification.

Rafael selected a temporary hosting link instead of `dev.puttbrothers.com`.
The preview is public to anyone with the link, but sends `noindex` metadata and
headers and a restrictive robots.txt. This is not password protection.
Form submissions and PDF uploads are explicitly disabled in the preview.
Preview-to-production promotion is a separate approval and is never caused by
switching branches alone. Future `website-v3` can have its own branch/preview;
promote a tested build deliberately and preserve prior release tags for rollback.
Raw media masters remain local; deployable WebP/MP4/PDF assets are tracked.

[V1-README.md](V1-README.md), [RELEASE-V1.md](RELEASE-V1.md) and
[PERFORMANCE-2026-10-01.md](PERFORMANCE-2026-10-01.md) remain historical references
for the stable site and recovery. They do not describe a V2 deployment.

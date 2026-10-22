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

Final tests/build, active production version and public checks will be recorded
after the guarded release. No live lead or valid PDF is sent by the release
checks. AWS services/secrets and DNS are not changed by this worktree.

Rollback with the recorded version restores the previous V1 interface with the
Cloudflare backend, while RDS remains stopped. It does not restore deleted AWS
data or alter DNS. Confirm the active version and bindings before any rollback.

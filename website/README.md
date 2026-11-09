# Putt Brothers website: single source for dev and official

## Current workspace, updated 10 November 2026

Work in `WebsiteLocal/website`. This is the single website source, consolidated
from the approved official V2. The Git worktree root is `WebsiteLocal`, one level
above, and keeps the historical branch `website-v2-production`. The name does
not permit skipping dev review. The existing repository is
`https://github.com/ipdcweb/PuttBrothers`; no new remote repository was created.

The future platform is in sibling `../app`. This directory's `app/` remains the
website's Next/Vinext routes. See the [workspace map](../README.md).

Historical V1, AWS retirement and the former preview are in `../../Backup`.
Shared Git metadata remains in `../../Backup/WebsiteLocal_V1/.git`; do not
remove it. Originals stay under `../../New Website`. Media synchronization
inputs and receipts needed by the single source must remain available locally.

## Local to dev to official

Run the public workflow commands from `WebsiteLocal`:

```powershell
pnpm run build:dev
pnpm run deploy:dev
```

The build prepares the dev target without publishing. Deploy requires the
corresponding authorization. Review the dev link with Rafael before promotion.
After approval of that same revision:

```powershell
pnpm run build:production
pnpm run deploy:production
```

Production publication requires the matching dev receipt for the same HEAD and
the normal configuration/source guards. A new edit after review returns to dev.
The receipt is technical evidence, not a replacement for Rafael's approval.

Use Vinext and the guarded target commands so the custom Worker remains in the
build. Keep the pinned dependency/lockfile versions unless a dependency change
is necessary. Existing dependencies do not need routine reinstalling to start
work. Do not publish generated output from a different target or bypass guards.

## Environment isolation

| Target | Worker and URL | Behavior |
| --- | --- | --- |
| Dev | `puttbrothers-v2-preview`, https://dev.puttbrothers.com/ and retained https://puttbrothers-v2-preview.team-web-592.workers.dev/ | Only the exact Dev custom domain, review R2 buckets, limiter `2026102301`, `PREVIEW_MODE=true`, noindex and blocked contact/PDF writes. |
| Official | `puttbrothers-com`, https://puttbrothers.com/ | Existing eight routes, production R2 buckets, limiter `2026102302`, `PREVIEW_MODE=false`, public indexing and existing secrets preserved. |

Dev is public to anyone with the link; noindex is not access control. The source
is shared but target configuration, assets/indexing and services remain isolated.
The official form's WorkOrg/FindLead contract and feedback flow are preserved.
PDF upload/download retains its R2 size/type/origin and rate-limit checks.

Do not submit real contact forms or upload PDFs during tests. Local development
is not automatically a network sandbox; use mocked integrations. The future
Microsoft migration belongs to the platform plan and does not follow from moving
folders. This consolidation does not publish or change remote services.

## Implemented scope and review

The approved V2 is the functional baseline. Read
[PRODUCTION-V2-RELEASE.md](PRODUCTION-V2-RELEASE.md) for its recorded publication
and [PREVIEW-RELEASE.md](PREVIEW-RELEASE.md) for prior dev releases. These records
keep their historical paths and commands; they do not redefine today's workflow.
[V2-PLAN.md](V2-PLAN.md) and [V2-VERIFICATION.md](V2-VERIFICATION.md) describe the
earlier design/review stages. New visual changes still need Rafael's approval.

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

On 10 November 2026 Rafael authorized adding `dev.puttbrothers.com` to the
existing Dev Worker and publishing the approved website revision to Dev and
official so both start with the same website content. The temporary workers.dev
link remains available. Future changes use local -> Dev -> client review and
approval -> official promotion of that same revision. There is one local source;
promotion does not require another folder or an automatic branch switch.
Preserve prior release records for rollback.
Raw media masters remain local; deployable WebP/MP4/PDF assets are tracked.

[V1-README.md](V1-README.md), [RELEASE-V1.md](RELEASE-V1.md) and
[PERFORMANCE-2026-10-01.md](PERFORMANCE-2026-10-01.md) remain historical references
for the stable site and recovery. They do not describe a V2 deployment.


## Complete AWS retirement, 23 October 2026

The AWS SDK has been removed. Layout PDF storage uses `LAYOUT_PDFS` and
`PDF_UPLOAD_RATE_LIMITER` bindings, random document URLs and private response
headers. Preview uploads remain disabled. Legacy event field `s3Url` is retained
only for browser compatibility; its value is now a Cloudflare URL.

See [AWS-RETIREMENT.md](AWS-RETIREMENT.md) for the historical retirement scope,
account cleanup, links and verification. The V1 backend migration is archived;
the current source already includes the approved V2. Do not reintroduce AWS.

The current consolidation and its validation are recorded outside the build in
[the local operation record](../../Backup/organization-2026-11-06-single-workspace/README.md).

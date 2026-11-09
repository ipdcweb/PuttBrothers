# Single local website source, updated 10 November 2026

- This directory is WebsiteLocal/website, the only active website source. It was
  consolidated from the approved official V2 source. The former separate preview
  is archived; never recreate two local website copies for dev and production.
- The active Git worktree root is WebsiteLocal, one level above this directory.
  Its historical branch remains website-v2-production. Shared Git metadata stays
  in ../../Backup/WebsiteLocal_V1/.git; do not remove that archive.
- Rafael's current workflow is local changes -> dev publication -> review and
  approval -> official promotion of the same revision. Use the guarded root
  commands build:dev, build:production, deploy:dev and deploy:production. A matching
  dev receipt is required for production; it does not replace Rafael's approval.
- The two Cloudflare targets remain separate. Dev is puttbrothers-v2-preview,
  with ONLY dev.puttbrothers.com as its custom domain and the existing workers.dev
  endpoint retained, PREVIEW_MODE=true, noindex and blocked form/PDF writes.
  Production is puttbrothers-com, with its existing eight routes,
  PREVIEW_MODE=false, public indexing and preserved secrets via --keep-vars.
- Preserve PRODUCT_MEDIA and LAYOUT_PDFS isolation: review buckets/limiter
  2026102301 for dev, production buckets/limiter 2026102302 for official.
- This consolidation is local. It does not authorize publication, DNS or secret
  changes, AWS operations, new remote repositories or real form submissions.
  Prior completed release authorizations remain documented in their records;
  future promotions follow Rafael's current dev approval workflow.
- Rafael explicitly authorized configuring dev.puttbrothers.com and publishing
  the current approved website revision to Dev and official on 10 November 2026.
  Future changes still follow local -> Dev -> client review/approval -> official.
  Never add production, wildcard, app or alternate subdomain routes to the Dev Worker.
- Preserve the approved Contact component, picker, phone input, submission
  feedback, planner and WorkOrg JSON contract including FindLead. The future
  Microsoft form migration is a separate platform milestone, not part of moving
  folders. Do not create real leads or upload PDFs during tests.
- Carousel arrows move one product at a time through all 39 records, with an
  individual counter and continuous rewind. No grouped pagination or duplicate
  rectangular arrows. Mobile carousel images are exactly 300px WebP; desktop
  cards use 720px WebP. Preserve original PNGs for detail/planner and Unity builds.
  Run scripts/prepare-carousel-images.mjs --verify before publication.
- Preserve the approved catalogue readers, product-image containment, mobile
  menu contrast, IAAPA links, planner illustration and always-enabled scroll hero.
- PDF storage and product media are native Cloudflare R2. Do not reintroduce AWS
  dependencies. The legacy s3Url event field remains a browser compatibility name.
- Do not use em or en dashes between words or sentences in website copy. Use
  commas, periods or natural phrasing; visual separators/empty markers may remain.
- The sibling ../app directory is the future operational platform. This
  directory's app/ remains Next/Vinext routing. Never mix their source or builds.
- Read README.md, relevant tests and installed Next/Vinext documentation before
  changes. PRODUCTION-V2-RELEASE.md and PREVIEW-RELEASE.md are historical release
  evidence; old paths and branch-specific commands in them are superseded by
  this single-workspace arrangement. Do not rewrite historical receipts.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

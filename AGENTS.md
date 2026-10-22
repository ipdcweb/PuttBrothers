# Authorized V2 production promotion, 23 October 2026

- This separate worktree is `WebsiteLocal_V2Production`, branch
  `website-v2-production`, created from approved preview source `8e759f3`.
- Rafael explicitly authorized publishing the current V2 as the official site
  while keeping the existing `WebsiteLocal_02` / `website-v2` preview separate
  for future improvements. The previous preview-only restrictions below describe
  that original worktree; this scoped production authorization supersedes them here.
- Commit/push of this branch and guarded deployment to `puttbrothers-com` are
  authorized. Use `pnpm run deploy:production`, which verifies 78 carousel WebP,
  tests, fresh Vinext build, production R2 receipts and the eight existing routes.
- Keep `PRODUCT_MEDIA` / `LAYOUT_PDFS` production R2 bindings, limiter namespace
  `2026102302`, `PREVIEW_MODE=false`, public indexing and `--keep-vars`.
- Preserve all approved V2 UI, WorkOrg/FindLead, original files and preview isolation.
  Do not edit the original V1 or V2 worktrees, DNS, AWS services or secrets here.
- Rollback is the AWS-independent V1 backend version
  `62af4949-e440-4891-ad43-819665e83830`; no RDS restart is needed for it.
- Publication evidence and maintenance flow: `PRODUCTION-V2-RELEASE.md`.

## Historical V2 preview workspace boundary

- Work only in `WebsiteLocal_02` on `website-v2` for the redesign.
- `../WebsiteLocal` is the stable V1 on `main`. Do not edit it as part of V2.
- Baseline: tag `v1.0.0-2026-10-01`, commit `30bccc445d63a70344674a6d9fddd7785488d9ce`.
- Rafael authorized the full local V2 redesign on 1 October 2026: new Home,
  carousel moved to Products, redesigned About/Contact surrounds/header/footer.
- Do not use em or en dashes between words or sentences in website copy. Use commas, periods or natural phrasing; visual separators and empty-value markers may remain.
- Keep the Contact component, picker, phone input and integrations unchanged.
- On 12 October 2026 Rafael authorized committing/pushing `website-v2` and a
  separate temporary hosting preview, with no DNS changes. Use only the
  `puttbrothers-v2-preview` Worker and the guarded `deploy:preview` command.
- No production deployment, DNS changes or credentials copying. Keep preview
  form/PDF writes disabled. Future production promotion needs separate approval.
- On 23 October 2026 Rafael requested migrating carousel/catalogue/images/Unity
  from AWS to Cloudflare. V2 now uses a bundled catalogue and the private
  `puttbrothers-product-media-review` R2 bucket, read-only through the Worker.
  Contact/PDF integrations remain outside this migration; do not remove AWS
  resources or promote V1 production as part of preview review.
- Rafael then explicitly requested complete AWS retirement on 23 October 2026.
  PDF storage is now native R2; do not reintroduce AWS dependencies. A separate
  `WebsiteLocal_AwsRetirement` worktree on `aws-retirement-production` preserves
  V1 appearance while migrating its backend. AWS deletion requires an authenticated
  inventory and preservation of historical PDFs/links; never affect unrelated IPDC
  resources. The prior preview-only scope remains for redesign promotion.
- Preserve the form's WorkOrg JSON contract (including `FindLead`), Cloudflare integrations,
  planner and performance fixes. Do not send real leads or upload PDFs during tests.
- Read `README.md` and `V2-PLAN.md` before starting the next stage.
- Carousel arrows must move one product at a time through all 39 records, with
  an individual counter and continuous rewind. Do not restore group pagination.
  Mobile carousel images are exactly 300px WebP; desktop cards use 720px WebP.
  Preserve original PNGs for detail/planner and existing Unity builds. Use
  `scripts/prepare-carousel-images.mjs --verify` before preview publication.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

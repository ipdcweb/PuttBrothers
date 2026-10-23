# V2 workspace boundary

- On 23 October 2026 Rafael approved the current official website and requested
  bringing this preview up to date as the isolated workspace for future changes.
  Baseline: production source `6895dbf`, documented at `a6f0997`, active version
  `2781ce5f-a326-41a9-97e6-d52ae30c7165`. Include the approved contact feedback,
  planner collapse after success and always-on hero in all future work. Those
  scoped Contact changes supersede the historical unchanged-form restriction.
  Preserve the WorkOrg contract and picker. Deploy only this preview Worker,
  retaining review R2, PREVIEW_MODE=true, noindex and blocked contact/PDF writes.

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
- Preserve the form's WorkOrg JSON contract (including `FindLead`), AWS integrations,
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

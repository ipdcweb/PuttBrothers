# V2 workspace boundary

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
- Preserve the form's WorkOrg JSON contract (including `FindLead`), AWS integrations,
  planner and performance fixes. Do not send real leads or upload PDFs during tests.
- Read `README.md` and `V2-PLAN.md` before starting the next stage.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

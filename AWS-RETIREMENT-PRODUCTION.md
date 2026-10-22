# V1 AWS retirement

Prepared on 23 October 2026 (Australia/Brisbane), following Rafael's instruction
to stop using the AWS server. This branch changes the backend while retaining
the V1 interface published at `puttbrothers.com`. It does not promote the V2 UI.

## Source and boundary

- Branch: `aws-retirement-production`, based on V1 commit `30bccc4`.
- Worktree: `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal_AwsRetirement`.
- The original `WebsiteLocal` folder, its branch and its uncommitted changes are
  preserved. The two already-published Instagram URL corrections are included.
- Previous production version: `7193bac3-40e3-4d83-b8f3-006e6bdcb91a`.
- Existing WorkOrg contact fields, token and delivery contract remain in place.
- All eight production hostname routes remain unchanged; no DNS changes.

## Backend changes

The 39-machine catalogue is bundled with the release. Its 78 product images and
10 complete Unity builds use the previously verified 198-file manifest, release
prefix `catalog-20261023-v1`, served through native R2 binding `PRODUCT_MEDIA`.
There is no network fallback to AWS. Known historical planner image URLs are
translated into local paths without contacting their previous host.

The PDF upload endpoint uses native R2 binding `LAYOUT_PDFS`. It preserves the
existing multipart input and success response fields while returning an opaque
same-origin `/layout-pdfs/YYYY/MM/UUID.pdf` link. Uploads enforce the same origin,
one PDF file, PDF signature, 10 MiB limit and five requests per minute per client
IP. The bucket remains private; document links act as bearer capabilities and
responses are private/no-store/noindex. No visitor email is placed in new keys.

The old AWS SDK dependency and storage credentials are unnecessary. Removing
resources or credentials in the AWS account is a separate operational step;
this code change alone does not delete them or migrate historical uploaded PDFs.

## Configurations

- Production: `wrangler.jsonc`, Worker `puttbrothers-com`, product bucket
  `puttbrothers-product-media-production`, PDF bucket
  `puttbrothers-layout-pdfs-production`, limiter namespace `2026102302`.
- Isolated validation: `wrangler.review.jsonc`, Worker
  `puttbrothers-aws-retirement-review`, no routes, `PREVIEW_MODE=true`, limiter
  namespace `2026102303`. Contact and PDF POST requests are blocked before app
  execution. This configuration reads production media and the isolated review PDF bucket.
- Build with `pnpm run build:vinext`; generic Next builds are not deployments.
- Keep existing production variables/secrets with `--keep-vars` during cutover.
- `pnpm run deploy:aws-retirement --review` or `--production` performs guarded
  tests and a fresh Vinext build without publishing. Add `--publish` only for
  the explicitly authorized release. Review deployment derives a separate
  generated config beside the production build, without rewriting source.

## Validation and release

- Forty tests pass: complete catalogue, planner, product media MIME/ranges and
  file allowlist, PDF validation/storage/ranges, WorkOrg contract, alias redirects
  and review isolation. Test storage is mocked; no lead or real PDF was sent.
- Final Vinext production build succeeds with all 14 existing routes.
- Type checking reports only the two pre-existing `CacheStorage.default` errors
  in `worker.ts`; no new error was introduced.
- Targeted ESLint reports zero errors and 11 warnings in inherited code.
- Dependency lock diff only deletes 517 lines belonging to the unused AWS SDK
  tree; all remaining dependency versions stay locked.

Deployment, live checks, removal of obsolete Cloudflare secrets and AWS shutdown
evidence must be recorded by the release operator; those actions have not
happened merely because this branch exists.

Rollback of application code uses the previously recorded Cloudflare version;
it reintroduces AWS dependencies and requires the old services to remain usable.
Data and AWS-resource deletion cannot be reversed by a Worker rollback.


## Isolated review publication and current hold

- Review source: `8ba7b9a`; version `4ebcb2f5-58cb-4a9b-9053-4a1980bd4e31`.
- Isolated URL: https://puttbrothers-aws-retirement-review.team-web-592.workers.dev
- No production deployment, DNS change or secret deletion was performed.
- Rafael subsequently requested reviewing all changes at the existing V2 preview
  https://puttbrothers-v2-preview.team-web-592.workers.dev/ before stopping AWS.
- Keep this backend-only branch ready, preserve the active production version and
  wait for Rafael's review before production cutover or resource deletion.

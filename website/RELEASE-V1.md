# V1 stable baseline - 1 October 2026

Timezone: Australia/Brisbane. This release normalizes the already-published V1;
it does not redesign the website or start V2.

## Source and production identity

| Item | Baseline |
| --- | --- |
| Canonical local source | `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal` |
| Repository | `https://github.com/ipdcweb/PuttBrothers` |
| Stable branch | `main` |
| V1 normalization branch | `codex/production-cloudflare` |
| Source tag | `v1.0.0-2026-10-01` |
| Cloudflare Worker | `puttbrothers-com` |
| Active production version, 100% | `c288ec73-3124-455f-8534-3f6ef0c14123` |
| Deployment time | 2026-09-30 20:13:53 UTC / 2026-10-01 06:13:53 Brisbane |
| Deployment message | Keep HTML fresh and recover browsers with cached self-redirects |

The source tag identifies the baseline commit, without relying on a mutable
branch name. `ProductionSource` is an older sibling snapshot, not the current
source. No files in that folder or `New Website` were replaced.

## Reconciliation evidence

- Read the active Cloudflare deployment and compared its downloaded Worker
  modules with the existing local `dist/server` bundle using SHA-256. Every
  returned server module matched byte-for-byte, before the validation rebuild.
- Compared served client resources with the local production build and inspected
  the live contact interface. The recent form and performance changes were already
  live but had not yet been committed to GitHub.
- Rebuilt from the current source successfully using the locked dependency tree.
  Vinext generates a fresh build ID and dependent chunk names on rebuild, so the
  newly generated `dist` is not represented as byte-identical to the old bundle.
  Old build ID: `4fcceb1e-fea5-4af3-ab5a-e1febfbb54c4`.
  Validation build ID: `fb467c72-7c00-4fff-a340-9e6260bd6745`.
- No application runtime files were changed during normalization. The additional
  changes are documentation, local-secret ignore rules, a test script and mocked
  contact-contract tests. Existing application changes were preserved and saved.
- A new deployment was unnecessary: production already runs the application
  being recorded by this source baseline. DNS, secrets and external data were
  not changed. GitHub history is preserved with a fast-forward, not a force push.

## Validation

- `node --test tests/*.test.mjs`: 14 passing tests (7 Worker routing/cache tests
  and 7 contact API contract tests).
- Production Vinext build: successful, 14 routes generated.
- Targeted ESLint on Worker, contact API, picker and tests: zero errors, two
  pre-existing warnings (button `aria-invalid` support and anonymous default export).
- Local compiled Worker preview: `http://127.0.0.1:8790/contact`, desktop and
  390px mobile. No application console errors or broken contact-page images in
  the checked states; no horizontal document overflow.
- Final public GET checks: canonical home/contact returned HTTP 200; all seven
  aliases returned HTTP 301 to the canonical `/contact?source=v1-baseline`,
  preserving path/query. All nine responses included `Cache-Control: no-store`
  and `CDN-Cache-Control: no-store`.
- Live IAAPA selection and local IATP selection verified. Contacts remain in
  alphabetical order: Douglas, Imre, Joao, Luiz. The selected field uses the
  first name. Mocked server tests preserve full name in `FindLead`.
- The custom-name input has `maxLength=20`; the input and Add button share the
  contacts' scroll container. The mobile modal fits the viewport. Selecting
  `Alex Example` closes the modal and displays `Alex` in the field.
- Secret-pattern review of current source and pending Git history found no
  literal credentials. This is a targeted review, not a comprehensive security audit.
- No actual contact form was submitted. WorkOrg lead creation, email delivery
  and S3 PDF upload were not retested end-to-end; tests mock outbound requests.

See `PERFORMANCE-2026-10-01.md` for the earlier incident, deployment evidence and
performance measurements. Its statement "no commit or push" describes that
earlier incident task, not this subsequent baseline normalization.

## Recovery

### Recover source without overwriting work

First inspect `git status`. Preserve any uncommitted changes; never use a hard
reset or forced checkout to return to this release. From a clean checkout, an
authorized maintainer can inspect the tagged source with:

```powershell
git fetch origin --tags
git switch --detach v1.0.0-2026-10-01
pnpm install --frozen-lockfile
pnpm test
pnpm run build:vinext
```

A separate worktree is preferable when other work is in progress. Do not create
or overwrite a sibling folder without first checking its contents. Detached HEAD
is for inspection/recovery; create an appropriate branch before new development.

### Recover deployed V1

Check the current deployment, available versions, bindings and routes first.
With explicit publication authorization, if Cloudflare still retains the version:

```powershell
pnpm exec wrangler deployments status --name puttbrothers-com
pnpm exec wrangler rollback c288ec73-3124-455f-8534-3f6ef0c14123 --name puttbrothers-com
```

Verify the canonical site, aliases, assets and form interface after rollback.
If that version is no longer available, rebuild the source tag, validate a
preview, and deliberately deploy while preserving production variables/secrets.
Never assume that switching Git branches switches the live website.

The older validated incident-fix version
`faa62547-1ca8-4260-9ec4-7152efc4a67a` is a fallback that omits the optional browser
cache-recovery header. **Do not restore**
`9d45d2eb-5611-4f69-9e30-438c6659884c`: it reintroduces the redirect-cache incident.

Code rollback does not restore DNS, credentials or AWS/WorkOrg data. Preserve
those independently; no such settings were changed during this normalization.

## V2 boundary

V2 is not created in this task. When authorized, start from this tag in a separate
branch and local folder, with an isolated preview Worker and no production routes.
Keep this V1 tag and its recovery instructions available throughout the redesign.

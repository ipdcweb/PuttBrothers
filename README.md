# Putt Brothers website - V1

Canonical production source: `C:\Users\Rafael\Wesbites\puttbrothers.com\WebsiteLocal`.

- Website: https://puttbrothers.com
- Repository: https://github.com/ipdcweb/PuttBrothers
- Production Worker: `puttbrothers-com`
- Stable V1 tag: `v1.0.0-2026-10-01`
- Release evidence and rollback: [RELEASE-V1.md](RELEASE-V1.md)

`main` is the stable source. `codex/production-cloudflare` records the V1
normalization work. Future V2 work must use a separate branch and local folder;
it must not replace this V1 working directory or production routes without approval.
The sibling `ProductionSource` folder is an older snapshot, **not** current production.
The sibling `New Website` folder contains future brand references, not V1 source.

## Stack and installation

React 19 / Next.js 16, Vinext, Vite, Tailwind CSS and Cloudflare Workers.
Use the versions in `pnpm-lock.yaml`; do not upgrade dependencies during recovery.
The baseline was built with Node.js 24.18.0. The package manager is pinned in
`package.json` to pnpm 11.19.0.

```powershell
pnpm install --frozen-lockfile
pnpm test
pnpm run build:vinext
pnpm exec wrangler dev --config dist/server/wrangler.json --port 8790 --local
```

The production build is **`build:vinext`**, producing `dist/client` and
`dist/server/wrangler.json`. The generic `build` / `dev` / `start` scripts are
Next.js commands and are not the Cloudflare production deployment path.
`dev:vinext` starts the application development server on port 3001.

## Production invariants

- Apex and `www` for `.com`, `.ch`, `.de` and `.uk` are handled by this Worker.
- The seven aliases redirect to `https://puttbrothers.com`, preserving path/query.
- Do not re-enable hostname-agnostic Workers Cache: it caused alias redirects
  to be served on the canonical host. Redirects and HTML must remain `no-store`.
- Keep the explicit URL-keyed catalogue/media cache, request deadlines and
  immediate real-product fallback. See [incident report](PERFORMANCE-2026-10-01.md).
- Preserve AWS catalogue, S3 product/3D media, layout planner and PDF upload.
- Preserve the WorkOrg JSON contract, especially `howDidYouFindUs.FindLead`.
- IAAPA Expo / IATP Annual Conference open the person picker. It shows Douglas,
  Imre, Joao and Luiz alphabetically; the selected field uses first name while
  `FindLead` contains full name. Custom names are limited to 20 characters.
- "Someone else", its input and Add button belong to the same scroll area.

## Configuration and secrets

Production credentials stay in Cloudflare. Local `.env*` and `.dev.vars*` files
are ignored. Never commit credentials, copy them from history, or print them.
Only these names are documented:

- `WORKORG_API_TOKEN`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`
- `LAYOUT_PDF_BUCKET`, `LAYOUT_PDF_PUBLIC_BASE_URL`
- Optional override: `WORKORG_CONTACT_API_URL`

Without credentials, local contact/PDF delivery is unavailable. Automated contact
tests stub all outbound calls and use fictitious credentials; they do not send
email, create leads or upload PDFs. Do not submit real test leads without approval.

## Publishing and recovery

Publishing is a separate, authorized operation, not a side effect of committing.
First run tests, build and browser checks against a local/isolated preview. Record
the active Cloudflare version and confirm bindings before publishing. The existing
`deploy:vinext` script does not build first; never run it against a stale `dist`.
Preserve configured variables/secrets (`--keep-vars` where applicable).

Do not change DNS, email, registrar settings or external AWS/WorkOrg data during
a normal website release. Git tags preserve source; Cloudflare versions preserve
deployed code/assets. Neither rolls back data held by external services.

For future V2, start from the stable V1 tag in a separate worktree and use a preview
Worker without production routes. Switching a Git branch alone does not switch
the live website: its verified build must be deliberately deployed.

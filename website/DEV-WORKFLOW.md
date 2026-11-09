# Putt Brothers: local to Dev to official

Rafael authorized this workflow and the initial publication of the same website revision to both environments on 10 November 2026.

## Source and branches

- One local source: `C:/Users/Rafael/Wesbites/puttbrothers.com/WebsiteLocal/website`.
- Existing repository: `https://github.com/ipdcweb/PuttBrothers`.
- Review branch: `dev.puttbrothers.com`.
- Official release branch: `website-v2-production`, retained from the existing workflow.
- Historical branches, including `main`, remain intact. Do not reset them or infer that pushing a branch alone authorizes a production deployment.
- The independent local platform at sibling `app/` is excluded from the public website repository. It is not part of either website build or deployment.

## Environment map

| Website | Cloudflare Worker | Website behavior | Associated platform, separately deployed |
| --- | --- | --- | --- |
| https://dev.puttbrothers.com/ | puttbrothers-v2-preview | noindex, PREVIEW_MODE=true, isolated review R2/limiter, blocked contact/PDF writes | staging-app.puttbrothers.com, connects only to Dev |
| https://puttbrothers.com/ | puttbrothers-com | public indexing, PREVIEW_MODE=false, existing official WorkOrg form and production R2/limiter | app.puttbrothers.com, connects to the official website |

The existing `https://puttbrothers-v2-preview.team-web-592.workers.dev/` remains an alternate address of the same Dev Worker. Creating the website Dev hostname does not activate platform authentication, publish platform code or configure its integrations.

## Normal delivery

1. Work locally on `dev.puttbrothers.com`, using the same source folder.
2. Review the diff, verify privacy exclusions, test, commit and push that branch when authorized.
3. From WebsiteLocal, run `pnpm run deploy:dev`. The protected runner runs the complete suite, builds fresh, checks exact environment resources, publishes Dev and saves its commit/fingerprint/version receipt under `website/tmp/releases/`.
4. Show https://dev.puttbrothers.com/ to the client. Official promotion requires Rafael's approval of that revision.
5. After approval, advance `website-v2-production` to the exact reviewed Dev commit with a fast-forward merge, push it, and run `pnpm run deploy:production`.
6. Validate the published site and return the local checkout to `dev.puttbrothers.com` for subsequent work.

Node 24 must be on PATH. If the package-manager shim attempts to install dependencies, the equivalent guarded entry points are `node website/scripts/deploy-preview.mjs --publish` and `node website/scripts/deploy-production.mjs --publish`, run from WebsiteLocal. Omitting `--publish` builds only. Never deploy dist directly or bypass the release guards.

Production requires the exact commit and website fingerprint recorded by Dev, clean Git and a matching upstream commit. A new source edit requires a new Dev publication/review. One shared release lock prevents concurrent builds from replacing the shared generated output. Preserve existing production secrets through `--keep-vars`; never copy local platform credentials into these Workers.

## Initial release scope and recovery

The initial synchronized release includes the previously authorized single-folder source reorganization, the reviewed five-person team, updated Imre and Rubens portraits, partner order/links/logos/tooltips, WebP derivatives, and the full Rubens role. No operational platform is published.

Before this delivery the official Worker used version `a3879bd6-9fcc-4735-9fe3-3d39590de52b`, and Dev used `17afd18d-16f4-4aea-aa01-256fa2bf7a02`. Cloudflare version IDs and local release receipts are the recovery references; do not rewrite historical receipts. Rollback is a deliberate operation requiring its own authorization, never a Git reset/clean.

The zone is already active in the expected Cloudflare account. The new exact Dev hostname was publicly NXDOMAIN before creation; no existing Dev service needs replacement. This delivery preserves production routes, email records, registrar settings and nameservers. The Wrangler OAuth session cannot list full DNS records; public MX/TXT/Autodiscover/DKIM/DMARC checks were recorded locally for comparison. No DNS deletion or replacement is part of this delivery.

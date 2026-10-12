# V2 client review release

Date: 12 October 2026.

## Authorized scope

Rafael authorized GitHub publication and a temporary hosting preview, then chose
the hosting URL instead of a custom domain. Branch name: `website-v2`.

| Version | Source | Hosting |
| --- | --- | --- |
| V1 | `main`, stable tag `v1.0.0-2026-10-01` | Existing `puttbrothers-com`, production domains unchanged |
| V2 | `website-v2` | Separate `puttbrothers-v2-preview`, temporary workers.dev URL |
| Future V3 | Create `website-v3` only when requested | Separate preview before any deliberate production promotion |

Changing a Git branch does not change the live website. Promotion requires an
approved build/deployment. Keep version tags and Cloudflare deployment IDs so a
previous code/assets release can be restored without deleting later work.

## Production baseline before this publication

- GitHub `main`: `30bccc445d63a70344674a6d9fddd7785488d9ce`.
- Cloudflare active production version: `7193bac3-40e3-4d83-b8f3-006e6bdcb91a`.
- V1 has unrelated local edits in `components/app-section.tsx` and
  `components/footer.tsx`. They were not modified or included in V2.
- No GitHub Actions workflows were listed for this repository.

## Preview safeguards

- No production routes or custom DNS changes.
- No copying of production credentials or bindings.
- Worker blocks contact submissions and PDF uploads before integration handlers.
- Visible preview notice, noindex metadata/headers and robots.txt.
- Public review link, not a password-protected staging environment.
- Original production media stays local. Only website derivatives are deployed.
- `deploy:preview` checks branch/repository/pushed commit/configuration, tests,
  builds and rechecks the generated configuration before publishing.

## Publication evidence

Pending deployment confirmation. Record the actual URL, source commit, Cloudflare
version and remote smoke checks after a successful deployment. Do not describe
the preview as live before those checks complete.

## Review

Technical tests do not constitute visual approval. Rafael/client review is still
required for desktop/mobile composition, scrolling rhythm and final sales copy.

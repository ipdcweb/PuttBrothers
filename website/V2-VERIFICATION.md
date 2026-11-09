# V2 technical verification — 1 October 2026

Scope: local worktree only. Technical verification is not visual/client approval.
No production deployment, DNS modification, Git commit/push, real lead submission
or PDF upload was performed.

## Automated checks

- Vinext five-stage production build: passed.
- Node tests: 20/20 passed (14 existing integration/cache contracts + 6 new V2
  isolation, page-composition and responsive-WebP asset checks).
- Targeted ESLint: new pages, shell, scene component, scroll handler, asset scripts
  and V2 tests passed without errors/warnings. The reused ProductsShowcase retains
  two pre-existing warnings (`any` and a state update in an effect); its catalogue
  behaviour was not rewritten.
- `git diff --check`: passed, apart from informational Windows line-ending notices.
- Standard `tsc --noEmit`: not fully clean. It reports three existing Workers
  `CacheStorage.default` typing errors in unchanged worker.ts. The same errors
  occur in V1 (V1 additionally has stale generated Next route-type errors).
  No V2 application type errors were reported. Vinext compilation succeeds.

## Protected source

Compared with baseline commit `30bccc445d63a70344674a6d9fddd7785488d9ce`:
Contact, trading-show picker, phone input, world map, all six API handlers, Worker,
planner, hooks and coverflow implementations are unchanged. ProductsShowcase only
adds optional heading/description/CTA props with backward-compatible defaults.

The form remains a sibling outside the new `.pb-v2` typography scope. Browser
computed styles confirm Poppins on the form and Montserrat on new V2 content.
New shell anchor offsets do not restyle form fields or alter its data contract.

V1 working tree remains clean. V2 uses its own preview name, empty route list,
disabled public endpoints, noindex metadata and a deployment guard. The local
Wrangler reports only the local ASSETS binding; no production secret files copied.

## Browser checks

Compiled Worker preview: `http://127.0.0.1:8792` in a dedicated Chrome context.
Browser checks use DOM, computed styles, accessibility trees and network responses,
not screenshots or an autonomous visual signoff. The agent-browser executable is
not installed; Chrome DevTools was used for equivalent technical checks.

- Home renders real HTML headings, links and FAQ; FAQ opens with its answer.
- Form source picker opens IAAPA Expo, shows four alphabetical contacts and
  Someone else with its input and Add control. Selecting João shows only the
  first name in the field. No submit button was activated.
- Products catalogue GET returned 200 and 39 products. Carousel next slide and next
  group work; mobile images load through the existing media proxy. Local collection
  cards use the new WebP copies. AWS media paths remain unchanged.
- Preview metadata is `noindex, nofollow`; page titles have one brand suffix.
- Initial browser checks found the inherited overflow-x:hidden preventing the new
  sticky header from sticking. The shell now uses overflow-x:clip; confirmed header
  top remains 0 after scrolling, without changing the form component.
- Project CTA navigation respects the form anchor rather than forcing page top.
- Final anchor check: form top 95px and sticky header bottom 95px on desktop.
- All four routes were checked at 1360×720, 834×1112 and 320×740; Home and selected
  interactions additionally at 1360×900 and 390×844. One h1 per page, meaningful
  content and no framework error overlays in all checks. New text blocks did not
  overflow their widths. Coverflow intentionally positions neighbouring slides
  outside the viewport; the document remains constrained, as in the original.
- Home selected the 1672px desktop hero, 1100px tablet export, and separate 640px
  portrait mobile export. Below-the-fold scenes are lazy-loaded, not missing.
- Mobile menu opens, closes with Escape, and returns focus to its toggle.
- Carousel image modal opens/closes. Desktop 3D action opens the preserved Rack'Em
  Up Unity iframe on Amazon S3; its document returned HTTP 200. Full WebGL interaction
  remains a manual device check. The inherited mobile UI intentionally hides 3D.
- All four real About portraits loaded from their new WebP files.
- All three catalogue download URLs returned HTTP 200 / application/pdf using HEAD.
- No application console errors during the checked Home, Contact and Products
  interactions. Vinext may emit an unused route-CSS preload warning after prefetch;
  it does not stop rendering or navigation.

Final browser state: desktop Home at the local URL, scroll position 0, ready for
Rafael's visual review. The local server must remain running for that URL to work.

## Remaining review / limits

- Rafael must review the visual hierarchy, scene crops, wording and layout on actual
  devices. Concept images are explicitly labelled and are not a real-project gallery.
- Local GET checks do not replace production latency measurements across regions.
- No live WorkOrg email/lead or PDF upload test: those writes were intentionally
  avoided. Mocked contract tests preserve FindLead and the existing JSON schema.
- Confirm the separate preview hostname and GitHub push before publishing anything.
  Suggested `dev.puttbrothers.com` is not yet configured or live.

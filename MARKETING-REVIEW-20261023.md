# Marketing review, 23 October 2026

## Preview-only catalogue reader and collection calls to action

Rafael requested viewing the existing Mini Golf and Table Golf catalogues inside
a large branded modal, one PDF page at a time, with arrows and mobile swiping.
CatalogueViewer reuses Radix Dialog for focus management, scroll lock and Escape,
and the installed Swiper for single-page navigation, swipe/pinch and zoom. The
reader provides previous/next controls, a page counter, keyboard arrows/Home/End,
fit/zoom and an optional original PDF download. Opening resets to the first page.
Only the current page and its neighbours mount images; no catalogue page images
are requested until its modal opens. Image failures retain the PDF fallback.

The existing PDFs remain unchanged. scripts/prepare-catalogue-pages.py renders
all 33 Mini Golf and 12 Table Golf pages using Poppler, with 900px and 1800px WebP
variants and source-content versioned paths. lib/catalogue-pages.json records
source and page checksums; tests reject missing/stale/corrupted reader assets.

At Rafael's follow-up request, the four collection actions now sit outside the
flexible copy area in equal-height yellow footer strips, keeping each pair's
separator aligned and making the whole strip clickable. The complete 2026 PDF
retains its download behaviour with a yellow panel, larger heading and a black
button. Scope is only V2 preview, preserving production, DNS and integrations.
- Published source `6e50001`, preview version
  `8dd6161e-2fe3-4dd2-8962-2ff8d654afaa`. ESLint, all 62 tests, media checks and
  the guarded build/release passed. Typecheck reports only the two pre-existing
  worker.ts CacheStorage.default errors; no catalogue/component type errors.
- Verified all 90 published WebP variants via HTTP 200 and their SHA-256 hashes.
  The preview retains noindex, nofollow, noarchive. PDF originals are unchanged.
- Chrome confirmed both catalogues, page counters (33 and 12), next/last/first
  navigation, disabled end controls, fit/zoom, Escape/close, focus restoration,
  scroll lock and reopening at page one. No reader images mount before opening;
  only current/adjacent pages mount while reading. No console errors reported.
- Reader bounds fit 1360x900, 1366x700, 820x1000 and 390x844. Mobile uses 900px
  WebPs with contain and no horizontal page overflow. Native phone swipe/pinch
  and visual approval remain for Rafael to check on his device.
- Paired card footer tops match exactly on desktop, with a common 104px outer
  height and yellow background. The complete 2026 panel is yellow, the heading
  is enlarged, and the black download action retains its original PDF link.
- Proofs: tmp/catalogue-reader-v2-20261023.png and
  tmp/catalogue-yellow-actions-v2-20261023.png. The preview reader is open in Chrome.

## Preview-only original planner image and product modal fit

Rafael requested restoring the original planner illustration from the enquiry
form. Products now uses the existing /images/layout-drag-drop.png in its natural
1429 x 879 proportion, retaining the section text and enquiry link. The former
catalogue collage and its unused board styles were removed from this component.

The product detail modal now reserves space for its caption inside a bounded
90dvh container. The media area can shrink in both desktop and mobile layouts;
long captions scroll within their allocated space. Explicit inline objectFit:
contain overrides Vinext Image's default inline cover style, which previously
beat the Tailwind object-contain class and cropped the original machine PNGs.
Original product assets, carousel thumbnails and Unity viewer paths are retained.
Only V2 is authorized for publication; official source and deployment stay intact.
- Published source `7bbb404`, preview version
  `e1bba36d-284b-431d-90a9-2a7ddcbc3094`. ESLint, all 60 tests, media verification
  and the guarded Vinext build/deploy passed.
- Chrome confirmed loaded original PNGs for Space Z (1280 x 953) and Raptor Run
  (1280 x 923), with computed object-fit contain. The modal and caption remain
  within 1360 x 900, 1366 x 700 and 390 x 844 viewports. Close/reopen works.
- The restored planner asset loads at its original 1429 x 879 proportion on
  mobile and desktop, with no mobile horizontal overflow. No console errors.
- Proofs: tmp/product-modal-fit-20261023.png and
  tmp/original-planner-restored-20261023.png. Visual approval remains Rafael's.
- Read-only deployment inventory confirms the official Worker still serves
  version `2781ce5f-a326-41a9-97e6-d52ae30c7165` from source `6895dbf`.

## Preview-only mobile menu header contrast

Rafael reported that opening the mobile menu left the header bar white behind the
white Putt Brothers wordmark. The header now exposes its existing menu-open state
and uses solid #0b0d10 while open, matching the navigation panel. The original logo
and closed-state transparency/scroll shade remain unchanged. This correction is
limited to the V2 preview; production is not part of this publication.

- Published source `26a291a`, preview version
  `4fecce31-5fcb-443c-9703-36e94ecb4775`. ESLint and the guarded build/release passed.
- Chrome reproduced the transparent header before publication, then confirmed
  rgb(11,13,16) for both header and menu at 390px and 320px, with a loaded original
  logo and no horizontal overflow. Closing restores transparency, and selecting
  Products closes the menu and resets the state. No console errors were reported.
- Local proof: tmp/mobile-menu-dark-header-20261023.png. Production files and
  deployment were not modified. Rafael retains visual approval on the phone.

## Preview-only IAAPA booth map invitation

Rafael requested adding the supplied IAAPA map URL to the header invitation and
alongside Let's meet at IAAPA in chapter 05, exclusively in V2. The shared
IaapaExpoMapLink uses the exact URL with hallID=A, level=1 and selectedBooth
booth~W2701. Chrome confirmed Putt Brothers and West Building, W2701 at that link.
Both placements retain the existing internal contact CTA and add View our booth
on the map, an external-link icon and a visible opens in a new tab description.
The external anchor uses target=_blank with noopener noreferrer. The static
media-error fallback also includes the same final-chapter invitation.

This is a new preview-only refinement after synchronization. Production remains
at its approved baseline until Rafael separately approves this addition.

- Published source `d357a4c`, preview version
  `45e88723-1cfa-4f60-851b-e0c75df6f272`. ESLint, all 60 tests, the build and media
  guard checks passed. Public checks confirmed the exact booth query, new-tab
  attributes and visible hint, noindex and blocked preview writes (403).
- Chrome verified that clicking the header map link opens a separate map tab.
  Chapter 05 retains its contact CTA and shows the map option beside it on desktop,
  wrapping below it at 390px. The final chapter and header popover fit the mobile
  viewport without horizontal overflow. Local proof is ignored under
  tmp/iaapa-map-invite-preview-20261023.png and
  tmp/iaapa-map-chapter05-preview-20261023.png.
- Official deployment history, excluding the CLI update-notification banner,
  remains identical before/after publication, active version
  `2781ce5f-a326-41a9-97e6-d52ae30c7165`. Its Home does not contain the new map link.
- Rafael subsequently asked whether the interactive map can open inside a modal.
  A fresh HTTP response from the exact supplied map URL returns X-Frame-Options:
  DENY and CSP frame-ancestors 'self'. Therefore third-party iframe embedding is
  blocked by the map provider. No embedding/proxy workaround was implemented.
  A static map-preview modal with a link to the live map is an optional alternative,
  pending Rafael's preference; current V2 links continue opening the real map in
  a new tab. Neither the official site nor the preview's write restrictions changed.

## Preview synchronization with the approved official site

Rafael approved the official website and requested updating the preview to match
it for future improvements without affecting production. The synchronization
includes all prior local marketing/header/planner changes, the always-on scroll
hero, contact loading/success dialog, planner reset after successful submission,
failure preservation, duplicate-send protection and server-side validation.

Source baseline: production runtime `6895dbf`, documented at `a6f0997`, official
Worker version `2781ce5f-a326-41a9-97e6-d52ae30c7165`. The V2 branch retains its
own preview notice, noindex metadata/headers/robots, PREVIEW_MODE=true, review R2
buckets, rate limiter and guarded preview deployment. Real form/PDF writes remain
blocked. No production files, routes, DNS, secrets or deployments are changed.

The local changes described below are historical. They are now included in this
synchronization rather than left pending as uncommitted preview refinements.
Publication and verification results follow after the guarded release.

- Published preview source: `1af8fe3`, version
  `e39bca17-fb7d-46a2-bcd4-7fdf88183947`, on the existing workers.dev URL.
- The preview guard passed all 60 tests, a fresh Vinext build, 78 WebP checks and
  original media receipts. ESLint had no errors, with the eight pre-existing
  Contact warnings. Approved UI/contact source hashes match production.
- A full diff across app/components/lib/styles/hooks/assets/public and worker.ts
  has only the five expected environment files: Home/Contact preview notice,
  metadata layout, global noindex headers and robots.txt. The notice is the only
  Home/Contact markup difference; review storage/deployment configuration remains
  isolated. Common contact/scroll code and the new tests are synchronized.
- Public checks passed five HTML pages, noindex, blocked contact/PDF POST (403),
  all 39 products, 30 planner records, four illustration WebPs and desktop/mobile
  video byte ranges (206). Browser checks confirmed automatic hero readiness,
  mobile layout with 60px miniatures, contact/planner expansion, no horizontal
  overflow or console errors. Chrome is left on the preview Home.
- Official deployment history was read before and after publication and is
  identical. Official version remains `2781ce5f-a326-41a9-97e6-d52ae30c7165`.
  Production worktree/files, Worker, DNS and secrets were not changed.
- Local evidence is ignored under tmp/preview-sync-release-20261023.log,
  tmp/verify-preview-sync-20261023.json and
  tmp/preview-synced-with-official-20261023.png. New improvements should start from
  this baseline and be approved in preview before any future official release.

Source: the twelve-page `Review website Pb_01.pdf` supplied by Rafael.
Rafael approved applying the review to the existing V2 temporary preview only,
keeping the product carousel. Marketing approval and production promotion are
separate steps. Do not deploy this revision to `puttbrothers-com` automatically.

## Local follow-up and subsequent official promotion

Rafael requested further local changes after reviewing the published preview.
These working-tree changes remain uncommitted here and have not been deployed to
the preview Worker. Rafael subsequently authorized promoting their exact UI
snapshot to the separate official production worktree. Official runtime source
`8385195`, version `79f38e5c-8af1-47f8-a67e-999e01677d5f`, includes them and removes
the preview notice from Home and Contact. Production form/PDF writes are enabled;
this preview remains blocked. See the production worktree's release record.

- The IAAPA invitation now replaces the far-right header project CTA. It is no
  longer beside the logo. Its existing details popup and contact destination remain.
- A narrow yellow enquiry tab stays at the right edge, centered in the viewport.
  Contextual invitations change with the visible section. It uses the existing
  Montserrat font, a message icon and an internal contact link. Width is 38px on
  desktop and 32px on phones; it hides behind dialogs, menus and focused form fields.
  It is excluded from the standalone/embedded planner through AppShell's existing
  planner boundary.
- Products' yellow planner section is now always visible, with no expansion button.
  A responsive HTML/CSS illustration replaces the AI image in this section. It uses
  four real catalogue renders with catalogue-derived names: Air Hockey (4), Bob's
  Plinko (7), Soccer (13) and Golden Gate (20). The four existing transparent 300px
  WebPs total 37,348 bytes and need no new image service or animation dependency.
  Following Rafael's size review, the library thumbnails and placed designs render
  at 60px; only the illustrative dragged Air Hockey design is larger (up to 160px).
  The composition is labelled as an illustrative arrangement, not to scale, and
  presents no fake interactive controls. The actual planner, Contact form and its
  original image are unchanged. The three steps explain square metres, selecting
  and positioning designs, and the summary PDF. Its CTA opens the enquiry form.
- Local validation: ESLint, fresh Vinext build and all 56 existing tests passed.
  Chrome confirmed contextual caption changes, the internal contact destination,
  the earlier guide expansion, the header placement and mobile sizing.
  Local image HEAD returned 200 and an empty local contact request stayed blocked.
- The always-visible illustration follow-up passed ESLint and a fresh Vinext build.
  Chrome verified all four original 300px WebPs loaded, seven miniatures render at
  60px, only the dragged design is larger, and no details/summary remains. There
  was no horizontal overflow at 1360x900, 1366x768, 768x1024 or 390x844. The desktop
  section measured about 868px high. The CTA opened local /contact#contact with
  the existing form and planner entry present; no form data was submitted. The
  final local browser check reported no console errors. Chrome remains on the
  local Products planner guide. Visual approval is Rafael's next step.
- Review URL: http://127.0.0.1:8792/products#planner-guide . Wrangler runs only on
  loopback with local bindings and PREVIEW_MODE=true. Visual approval is pending.

The release record below describes the earlier published preview, which has not
been redeployed with these local adjustments.

## Implemented changes

- Home: opening eyebrow and supporting line, all five chapter messages and the
  IAAPA invitation from PDF pages 1-3. Original video, timestamps, seek behavior,
  preferences and chapter IDs are unchanged.
- Header: a click-to-open IAAPA invitation beside the logo, using the existing
  accessible Popover component. Date, booth and location are supplied by the PDF:
  November 17-20, 2026; W2701; Orlando, Florida; West Building. Both the invitation
  and final hero chapter lead to the existing contact flow. The same details and
  CTA remain available in the static/reduced-motion fallback.
- Home experience card: `Interiors & fit-outs` replaces `Spaces with character`.
- Products: revised introduction; four cards ordered The Links Course, The Pro
  Series, Table Golf and Interactive Experiences. The two new cards lead to
  contact. Existing individual catalogues open as PDFs; the complete catalogue
  remains a download. Collections precede the retained carousel, following the
  supplied screenshots. The old `Two ways` heading is removed visually, with a
  descriptive accessible heading retained.
- New product cards reuse existing WebP assets. The Links Course image is labelled
  concept inspiration; the racing image comes from the existing supplied film.
  No new product photography or partner logos were supplied or fabricated.
- About: smaller opening section; revised introductory and mission copy; the
  leadership team precedes the new Our Partners section, followed by purpose and
  values, matching the screenshot sequence. Partner descriptions are transcribed
  for Cielo Vision, EHP Interiors and One Grid. Faith & Purpose, vision, values,
  leadership identities and original portrait files are preserved.

## Boundaries and validation

- Preview source: `website-v2`; Worker: `puttbrothers-v2-preview`.
- No production source, production Worker, DNS, secrets, AWS, form or planner
  integration changes. Preview contact/PDF writes remain disabled and noindex
  remains enabled.
- Carousel component, catalogue, navigation logic, 3D builds and image derivatives
  are unchanged. Retain one-product navigation, wrapping and all 39 records.
- Use the existing guarded `deploy:preview` flow, including the regression suite,
  verification of 78 carousel WebP files, R2 receipts and a fresh Vinext build.
- TypeScript's two existing `CacheStorage.default` diagnostics in `worker.ts`
  remain unrelated to this marketing revision.
- Verify the invitation, menu, collection CTAs, PDF links and carousel in a real
  browser. Final visual approval remains with Rafael and marketing.

## Published preview verification

- Runtime source commit: `d446104` on `website-v2`.
- Preview version: `63b9da8b-5dd0-4fd4-b4c5-2d4643ee9c9c`.
- URL: https://puttbrothers-v2-preview.team-web-592.workers.dev/
- Guarded publication passed: 56 regression tests, 78 carousel WebP files,
  existing private media receipts and a fresh five-stage Vinext build.
- ESLint passed for the changed TS/TSX components.
- Post-publication checks passed: 39 content/isolation checks, 22 existing preview
  route/media/write-blocking checks and both individual PDF catalogue HEAD checks.
- The four official pages retained their exact extracted text hashes from the
  pre-implementation capture. No official deployment occurred.
- Chrome confirmed the invitation opens/closes and its CTA navigates to the preview
  contact anchor. The four collection links have the intended destinations and
  catalogue PDFs open in a new tab. The 39-product carousel advanced one item with
  loaded 720px WebP images; its source and media were not modified.
- Functional DOM checks covered desktop 1360x900, mobile 390x844, tablet 768x1024
  and notebook 1280x720. No horizontal document overflow or application console
  errors were observed. The mobile invitation fits within the viewport; its menu
  navigates to About and closes. All three partners and Faith & Purpose are present.
- These checks establish technical behavior, not aesthetic approval. Rafael and
  marketing must review the changed pages before any official promotion.

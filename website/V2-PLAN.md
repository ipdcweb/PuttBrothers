# V2 implementation and next decisions

## Current scope

Rafael approved a complete local V2 redesign on 1 October 2026. It is implemented
only in this worktree on `website-v2`. Do not alter the stable
`../WebsiteLocal` directory. On 12 October 2026 Rafael authorized GitHub push and
an isolated temporary hosting preview, with no DNS change or production deployment.

## Direction requested by Rafael

- Home: replace the product-led opening with complete entertainment experiences,
  three offering areas, a connected design/build journey, benefits and FAQ.
- Products: reuse the existing Home carousel, add collection/catalogue access and
  retain the layout planner. Do not duplicate the old Products gallery.
- About: preserve the company facts, values, Faith & Purpose and real leadership
  contacts while applying the new editorial layout.
- Contact: redesign the surroundings and regional map section, not the form.
- Header/footer: new shared visual language, existing navigation/contact paths.
- Keep V1 available for recovery while V2 is developed and reviewed locally.

## Carousel reuse map (implemented)

- `app/products/page.tsx` renders `ProductsShowcase`; Home no longer does.
- `components/products-showcase.tsx` handles the catalogue, fallback and pagination.
- `components/coverflow.tsx` and `components/coverflow.css` provide the carousel UI.
- `/api/products/machines`, `/product-media/` and Amazon S3 remain its data/media path.
- The previous Products gallery is replaced by this carousel, not duplicated.
- `ProductsShowcase` now accepts copy/CTA props; its defaults and behaviour remain.
- The Products CTA leads to `/contact#contact`, not back to Products itself.
- The commented `Machines3DCarousel` is an old placeholder, not the live carousel.

## Preserve throughout the revision

- WorkOrg payload, including full name in `howDidYouFindUs.FindLead`.
- IAAPA/IATP contact selection, alphabetical contacts and custom-name limit/scroll.
- AWS catalogue, image proxy, 3D media and layout planner/PDF integration.
- Request deadlines, real-product fallback and the redirect-cache incident fixes.
- Existing public paths until an explicit navigation/redirect plan is approved.

## Source material and design interpretation

Read all 12 supplied brand boards and all 36 pages of the raster-only 2026 product
catalogue. The catalogue has no extractable text; page images were inspected via
six contact sheets. Source files in `../New Website` were not altered.

- Brand boards: yellow `#FFD400` leads; purple `#4B0087` accents; black/white anchor
  the design. Montserrat headlines/body for V2 areas; original Poppins retained
  for the approved form. Official logo assets are reused, never redrawn by AI.
- Brand story: "We build what's next in play", complete experiences, people and
  places, design/engineering/build/integration/support, not just single products.
- Catalogue pp. 1–3 introduce that positioning; pp. 4–33 present product designs;
  pp. 34–36 reinforce the turnkey journey and next step. No unverified performance
  percentages or technical product dimensions were copied into new marketing text.
- Reference boards are not used as full-page screenshots. Clean scene imagery is
  separate from responsive headings, paragraphs, icons, navigation and controls.
- Five clean conceptual scenes, including landscape and portrait hero compositions,
  were generated. They do not claim to show real completed projects or employees.
- Fifteen responsive WebP scene exports; real leadership portraits and the two new
  product-card pictures also have lightweight WebP copies. Original files remain.
- Supplied full 2026 catalogue is a separate download; older catalogues preserved.

## Preview and next approval

Rafael selected the temporary Cloudflare hosting URL instead of a custom domain.
Use branch `website-v2`, the separate `puttbrothers-v2-preview` Worker, noindex and
disabled contact/PDF writes. Client review and any promotion to production remain
separate steps. Production stays V1. See `PREVIEW-RELEASE.md` for release evidence.

## Preparation checks - 1 October 2026

The following were the initial copy checks, before the redesign. Current technical
checks are recorded separately in `V2-VERIFICATION.md`.

- Installed the locked dependencies in this worktree; dependency versions unchanged.
- All 14 existing regression/contract tests passed; no real forms were submitted.
- Vinext build completed successfully. Its generated Worker config has the V2 name,
  an empty routes list and disabled public preview endpoints.
- Compared the 243 inherited tracked files outside the four edited setup/doc files:
  no content differences; 63 text files only differ in Git's Windows line endings.
- The deployment guard exits with code 1 as intended. V1 remains clean on `main`.
- Setup changes are local and uncommitted; no push or deployment was performed.

# Marketing review, 23 October 2026

Source: the twelve-page `Review website Pb_01.pdf` supplied by Rafael.
Rafael approved applying the review to the existing V2 temporary preview only,
keeping the product carousel. Marketing approval and production promotion are
separate steps. Do not deploy this revision to `puttbrothers-com` automatically.

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

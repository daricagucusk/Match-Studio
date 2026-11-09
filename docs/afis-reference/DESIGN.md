# Match Studio — Reference Poster Design System

## Visual theme and atmosphere
Inspired by coach-provided reference posters 3, 4 and 5: premium dark-green stadium lighting, visible pitch geometry, bold editorial hierarchy and clear football-specific information. Screenshots are visual references, not fixed artwork containing player names. Poster rendering must use current local match and club data.

## Palette
- Pitch Ink (#06110C) — background
- Deep Panel (#0A2315) — information blocks
- Club Green (#78E69C) — key figures and headings
- Ivory (#F5FFF5) — player names and main headings
- Mint (#B6DCC2) — metadata and dates
- Border Green (#3C8656) — pitch and card strokes
Existing club accent remains supported.

## Typography
Heavy local sans display fonts, 1080x1350 and 1080x1920 targets. Each name is dynamically measured. Never truncate private player names without blocking export with a warning. Readable against stadium background; no external font downloads.

## Layout and Components
- Reference 3 / Premium Kadro: club crest, competition, opponent/date/stadium, first XI left and substitutes right, then organizational instructions.
- Reference 4 / Premium Saha: formation pitch, goalkeeper at bottom, correct tactical slots, shirt numbers and names; bench and optional notes.
- Reference 5 / Maç Programı: stacked age group / opponent / time / stadium panels, bold headline, strong footer; no personal data.
- Original four poster templates remain selectable.

## UI and responsive
The same Canvas rendering logic drives preview and PNG output. Size choice 4:5 and 9:16. App controls remain keyboard-accessible with 44px targets. No overlap, overflow or fabricated matches. Avoid generic gradient dashboards; stadium visuals are strictly inside export art.

## Motion
Static editorial PNG. Studio updates preview without network upload.

## Anti-patterns
No baked-in names from references; no invented fixtures, dates or shirt numbers; no public roster leakage, no external asset/CDN dependency, no modifications to production, main branch, API keys or real club records.

## Acceptance
TDD with synthetic data; verify full 26-player roster, 11-player formation, public privacy separation, up to five matches per portrait and eight per story, existing poster regression tests, visual PNG inspection and GitHub Actions before release.

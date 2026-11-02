# Design System: Match Studio — Aura Tactique

## 1. Visual Theme & Atmosphere

User-authorized final integration, 2 November 2026. Source: `D:/beyin2/Projeler/MatchStudio/stitch görseller.zip`, especially the component specification, tactical pitch, poster studio and gold crest. Restrained professional football operations: obsidian canvas, champagne actions, emerald pitch. Balanced information density; usable in a coaching session, on desktop and 360px phones. Existing workflows and real local data drive the screens. Screenshots are visual references, not executable specifications or evidence of real players, ratings or Play publication.

## 2. Color Palette & Roles

- Obsidian `#0B0E15`: page canvas.
- Charcoal `#141722`: panels; raised surfaces `#1D1F27`.
- Champagne `#E5C478`: primary action, selected state, focus and key metrics; dark action text `#0B0E15`.
- Text `#F8FAFC`; secondary text `#A6B0C0` with readable contrast.
- Structural border `rgba(229,196,120,.20)`; quiet separators `rgba(255,255,255,.08)`.
- Emerald `#0D281E`: pitch only; success, warning and error remain semantic colors. Club-picked colors remain valid in club/kit/poster content.

The supplied gold crest is the primary application mark. Preserve the original file and derive standard application icon sizes locally. Do not ship broken external image links. User-supplied sports design takes precedence over generic taste defaults; no neon-purple interface, inflated fake metrics, decorative notifications, or invented paid features.

## 3. Typography Rules

Outfit for display, Plus Jakarta Sans or a readable local sans fallback for body, tabular numerals for clock and analytics. Fonts must work offline; bundle any font used rather than depending on Google Fonts at runtime. Body at least 14px, controls at least 14px, headings controlled with clamp. Numeric hierarchy comes from weight and alignment. No generic serif dashboard text.

## 4. Component Stylings

Primary controls: champagne fill, dark text, 12px radius, no outer neon glow. Secondary controls: dark surface, fine champagne border, visible keyboard focus. Panels: 16px radius with restrained depth; high-density lists use separators. Labels above inputs, errors below. Data-empty states offer an actual next action. All interactive targets at least 44px; touch and keyboard retain existing functionality.

## 5. Layout Principles

Keep the existing navigation and module contracts; retain analytics, roster, pitch, clock, studio, archive and club access. Desktop has a stable sidebar and bounded work area. Mobile single-column layouts, accessible bottom navigation and overflow menu; no horizontal document overflow. The pitch keeps its sporting geometry and drag/tap hit targets. Tables may scroll inside a labeled region. Do not hide user actions to obtain screenshot similarity.

## 6. Motion & Interaction

Short opacity/transform transitions; reduced-motion disables decorative effects and haptics. No perpetual animation in a match operation screen. Wake Lock is best-effort and releases when not needed. Toasts expose live status and a close control. Installation prompts can be dismissed. Analytics filters are reset or scoped per club; no old state may cross clubs.

## 7. Anti-Patterns (Banned)

No fake ratings, example players seeded into real profiles, unsupported xG, invented WhatsApp delivery, fake Play download links, cloud-sync claims, or success labels that are not backed by state. No unreviewed screenshot HTML scripts/CDN imports. No removal of erasure tombstones, recovery v2, fixture session isolation, privacy route exception or package secret filters. No rewriting historical evidence during tests.

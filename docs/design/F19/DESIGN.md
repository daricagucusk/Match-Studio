# Design System: Match Studio F.19 Coach Operations

## 1. Visual Theme & Atmosphere
High-density, precise football coaching cockpit, rooted in the existing Match Studio Obsidian and Champagne palette. Use asymmetric space, not generic marketing dashboard cards. Motion minimal during matches.

## 2. Color Palette & Roles
- Obsidian Canvas `#0B0E15` — page background.
- Charcoal Panel `#141722` — information surfaces.
- Slate `#1C202B` — control backgrounds.
- Quiet Border `#494338` — structural outlines.
- Champagne Gold `#E5C478` — one primary accent for selections, focus and primary actions.
- Soft White `#F7F7F5` — player labels.
- Muted Ink `#B5B7C1` — metadata.
- Pitch Green `#113A29` — grass only.
No neon, purple-glow or pure black.

## 3. Typography Rules
Outfit display and Plus Jakarta Sans body, both bundled offline; tabular numeric clock. 14px minimum readable body and 44px minimum mobile tap target. No serif.

## 4. Component Styling
Role cards independently labeled LCB/RCB, LCM/RCM; show tactical role, First, Second, plus every extra alternative (expandable details). Selected uses thin gold outline, no scaling or motion displacing the pitch. Bench list is always scrollable without resetting.

## 5. Layout
Desktop >1200: enlarged pitch occupying left-dominant pane (~450–510px at 900px height), compact event+substitution pane. Fold-open uses two-sided workspace if practical; closed phone single column with contained scroll. No horizontal overflow.

## 6. Motion & Interaction
No perpetual animation or player movement. Use opacity and color for focus. Preserve scroll position, selection, and stable player anchors. Reduced-motion supported.

## 7. Prohibited
No invented player stats, no 2-option cap, no merge of left/right stoper or midfield roles, no player icon shift after selection, no dropped controls, no changes to underlying club data, no AI-generic mock content.

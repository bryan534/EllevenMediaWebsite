# Contact Page Redesign — Design Spec
**Date:** 2026-05-11

## Goal
Improve the visual richness and content of the contact page left column by adding a brand statement, services list, and client logos strip. The right-side form and overall two-column layout remain unchanged.

## Approach
Option A — Enriched Left Column. Keep the existing two-column grid layout; add content to the left side only. No structural changes to the form.

---

## Left Column — New Content Structure (top to bottom)

### 1. Section tag + Title (unchanged)
- Tag: "Get in Touch"
- Heading: `Let's start a <em>conversation</em>.`

### 2. Brand Statement (new)
- Text: "Digital experiences, built to last."
- Replaces the existing `contact-sub` paragraph
- Style: ~1.2rem, normal weight, white, no italic

### 3. Services List (new)
- Label: "What We Do" — uppercase, letter-spaced, muted gray (matches existing label style)
- List items:
  - Web Design & Development
  - SEO & Performance
  - Hosting & Infrastructure
  - Email & Domain Setup
  - DevOps & Deployment
- Style: vertical stack, small font (~0.95rem), muted white, with a thin left border or bullet dot marker

### 4. Contact Info (unchanged)
- Email: hello@ellevenmediagroup.com
- Location: Los Angeles, CA

### 5. Client Logos Strip (new)
- Label: "Trusted By" — uppercase, letter-spaced, muted gray
- 4 logos displayed in a horizontal row
- Source files from `/Users/bryan/Downloads/Brands/` — copy to `/static/images/clients/`
  - `Bazaart_5DD4CBCD-0BD5-49C7-910A-2D2105D856DC-2.PNG.webp`
  - `IronBreedlogo.D9U31G2H.avif`
  - `JB_Full_logo.png`
  - `bblogowhite-3.png`
- Logos: CSS `filter: brightness(0) invert(1)`, opacity ~0.6
- Layout: `display: flex; gap: var(--space-xl); align-items: center; flex-wrap: wrap`
- Max logo height: ~28px

---

## Files to Change
- `src/routes/contact/+page.svelte` — update left column HTML and styles
- `static/images/clients/` — add 4 logo files (copy from Downloads)

## Files NOT to Change
- `src/routes/contact/+page.server.ts` — form logic untouched
- Right column form markup and styles — untouched
- Global layout, nav, footer — untouched

---

## Responsive Behavior
- On mobile (≤576px): logos strip wraps or reduces to 2 per row
- Services list stacks naturally (already vertical)
- No layout changes needed for the two-column → single-column breakpoint at 992px (already handled)

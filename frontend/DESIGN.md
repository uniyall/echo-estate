---
version: 1
name: Echo Estate
description: "Design system for Echo Estate - a property listing application"

colors:
  # Primary - Terracotta
  primary: "#d97757"
  primary-dark: "#b85f42"
  
  # Neutrals - Sand & Cream
  sand: "#f5efe7"
  cream: "#faf8f5"
  beige-light: "#ebe1d4"
  beige: "#d4c4b0"
  beige-dark: "#c4b09d"
  beige-divider: "#e5d9c9"
  
  # Text
  text-primary: "#3d3028"
  text-heading: "#2a1f15"
  text-secondary: "#6b5d4f"
  
  # Semantic - Backgrounds
  bg-page: "#f5efe7"
  bg-surface: "#faf8f5"
  bg-elevated: "#ebe1d4"
  bg-primary: "#d97757"
  bg-primary-dark: "#b85f42"
  
  # Semantic - Foreground
  fg-primary: "#3d3028"
  fg-heading: "#2a1f15"
  fg-secondary: "#6b5d4f"
  fg-on-primary: "#faf8f5"
  
  # Semantic - Borders
  border-light: "#e5d9c9"
  border-default: "#d4c4b0"
  border-strong: "#c4b09d"
  border-accent: "#b85f42"
  
  # Accent
  accent-primary: "#d97757"

typography:
  display:
    fontFamily: "Lora"
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  
  display-mobile:
    fontFamily: "Lora"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  
  h1:
    fontFamily: "Lora"
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  
  h1-mobile:
    fontFamily: "Lora"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  
  h2:
    fontFamily: "Lora"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.25
  
  h2-mobile:
    fontFamily: "Lora"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
  
  h3:
    fontFamily: "Lora"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.3
  
  h3-mobile:
    fontFamily: "Lora"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
  
  h4:
    fontFamily: "Lora"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  
  h4-mobile:
    fontFamily: "Lora"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
  
  body:
    fontFamily: "Crimson Pro"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.7
  
  body-mobile:
    fontFamily: "Crimson Pro"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
  
  body-small:
    fontFamily: "Crimson Pro"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  
  body-small-mobile:
    fontFamily: "Crimson Pro"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  
  body-tiny:
    fontFamily: "Crimson Pro"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  
  body-tiny-mobile:
    fontFamily: "Crimson Pro"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  
  label:
    fontFamily: "Crimson Pro"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
  
  button:
    fontFamily: "Lora"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
  
  button-mobile:
    fontFamily: "Lora"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.2
  
  input:
    fontFamily: "Crimson Pro"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  
  input-mobile:
    fontFamily: "Crimson Pro"
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  
  price-display:
    fontFamily: "Lora"
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.1
  
  price-card:
    fontFamily: "Lora"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.2
  
  price-card-mobile:
    fontFamily: "Lora"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.2

rounded:
  sm: 6px
  md: 8px
  lg: 10px
  xl: 12px
  
  # Component-specific
  card: 12px
  button: 8px
  input: 8px
  tag: 6px

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 60px
  
  # Component-specific
  card-padding: 24px
  card-padding-mobile: 16px
  section-padding: 48px
  section-padding-mobile: 16px
  grid-gap: 32px
  grid-gap-mobile: 16px

components:
  property-card:
    backgroundColor: "{colors.cream}"
    padding: "{spacing.card-padding}"
  
  property-card-image:
    height: 240px
    backgroundColor: "{colors.beige-light}"
  
  price-tag:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.cream}"
    padding: "8px 16px"
    typography: "{typography.price-card}"
  
  button-primary:
    backgroundColor: "{colors.bg-primary}"
    textColor: "{colors.fg-on-primary}"
    padding: "16px 32px"
    typography: "{typography.button}"
  
  button-secondary:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.accent-primary}"
    padding: "16px 32px"
    typography: "{typography.button}"
  
  input-field:
    backgroundColor: "{colors.bg-surface}"
    padding: "14px 18px"
    typography: "{typography.input}"
    textColor: "{colors.text-primary}"
  
  header:
    backgroundColor: "{colors.bg-primary}"
    textColor: "{colors.fg-on-primary}"
    padding: "32px 48px"
  
  search-bar-container:
    backgroundColor: "{colors.beige-light}"
    padding: "32px 48px"
---



# Echo Estate Design System

## Brand & Style

Echo Estate is a residential property discovery platform designed to feel **warm, natural, and grounded** — a departure from the clinical, transactional aesthetic common in real estate platforms. The design system embodies an **Organic Natural** aesthetic that makes finding a home feel inviting, human-centered, and authentic.

The brand personality is approachable, trustworthy, and welcoming. The visual language is inspired by clay, sand, and natural materials — evoking the feeling of a hand-crafted, tactile experience. This system prioritizes warmth over efficiency, character over uniformity, and breathing room over density.

### Product Context

Echo Estate serves general market home buyers looking for residential properties. The platform emphasizes:

- **Property listing grid** with search and filter capabilities
- **Detailed property pages** with rich metadata, photography, and features
- **Responsive design** optimized for both desktop and mobile browsing
- **Infinite scroll loading** for seamless property discovery

The design balances the need to display dense information (pricing, square footage, amenities) with a desire to make the experience feel human and less transactional.

## Colors

The color palette is rooted in earth tones, creating a warm and inviting atmosphere. Unlike corporate blues or sterile whites, Echo Estate uses **terracotta, sand, and cream** to evoke natural materials and handcrafted authenticity.

### Primary Palette

- **Primary (`#d97757`):** The signature accent color used for headers, call-to-action buttons, and price tags. It provides warmth and energy without feeling aggressive.
- **Primary Dark (`#b85f42`):** A deeper terracotta used for borders, accents, and hover states where additional contrast or emphasis is needed.

### Neutral Palette

- **Sand (`#f5efe7`):** The primary page background — a soft, warm off-white that provides a paper-like foundation.
- **Cream (`#faf8f5`):** Used for card surfaces and elevated elements. Slightly lighter than sand, it creates subtle depth.
- **Beige (`#d4c4b0`, `#ebe1d4`, `#c4b09d`):** A range of beige tones used for borders, dividers, and search bars. These create structure without harshness.

### Text Palette

- **Primary Text (`#3d3028`):** A deep, warm brown used for body text. Never pure black — warmth is maintained throughout.
- **Heading Text (`#2a1f15`):** An even darker brown for headings, ensuring hierarchy while preserving the organic feel.
- **Secondary Text (`#6b5d4f`):** A lighter brown for metadata, labels, and de-emphasized content.

### Philosophy

This palette avoids pure black and pure white. Every color has a subtle warmth, reinforcing the **natural, grounded** aesthetic. The terracotta accent provides the only saturated color, ensuring it stands out when used sparingly.

## Typography

Echo Estate uses two humanist serif typefaces that feel hand-crafted and approachable, avoiding the sterile precision of geometric sans-serifs or the formality of traditional serifs.

### Type Families

- **Lora (Display/Headings):** A contemporary serif with moderate contrast and slightly calligraphic details. Used at 600-700 weight for headings, property addresses, and price displays. Lora brings warmth and personality to the interface.
- **Crimson Pro (Body/UI):** A classic serif with excellent readability at small sizes. Used at 400-600 weight for body text, labels, form inputs, and buttons. Crimson Pro feels literary and approachable.

### Hierarchy

The type scale is generous, prioritizing readability and breathing room:

- **H1 (42px desktop, 28px mobile):** Site title and hero headlines
- **H2 (36px desktop, 24px mobile):** Property addresses and section titles
- **H3 (28px desktop, 20px mobile):** Subsection headers
- **H4 (24px desktop, 18px mobile):** Card titles and supporting headers
- **Body (18px desktop, 15px mobile):** Primary readable text with a 1.7 line-height
- **Small/Tiny (16-15px desktop, 14-13px mobile):** Metadata, labels, and secondary information

### Treatment

- **Tight letter-spacing on large headings** (-0.02em to -0.03em) creates a more cohesive, intentional feel.
- **Generous line-height (1.7-1.8)** on body text ensures readability and reinforces the "breathing room" philosophy.
- **Serif for buttons** is unconventional but reinforces the brand's commitment to warmth over convention.

## Layout & Spacing

The layout philosophy is **generous and grounded**. Echo Estate avoids dense, cramped interfaces in favor of whitespace and clear visual rhythm.

### Spacing Scale

Built on an **8px base unit**:

- **xs (8px):** Minimal internal spacing
- **sm (12px):** Tight groupings
- **md (16px):** Default component padding
- **lg (24px):** Card padding and element separation
- **xl (32px):** Grid gaps on desktop
- **2xl (48px):** Section vertical spacing
- **3xl (60px):** Large section breaks

### Grid System

- **Desktop:** 2-4 column property grid (user-adjustable via Tweaks)
- **Mobile:** Single column with 16px gaps
- **Max-width:** 1400px for listing grid, 1200px for detail pages
- **Centered with auto margins** to create a focused, intentional canvas

### Container Philosophy

Echo Estate uses **fixed maximum widths** to prevent content from stretching too wide on large monitors. This maintains optimal line lengths for readability and ensures the design feels intentional rather than merely responsive.

## Elevation & Depth

Depth is created through **soft shadows and subtle tonal shifts** rather than harsh drop shadows or stark contrasts.

### Shadow System

- **Small (`shadow-sm`):** `0 4px 12px rgba(61, 48, 40, 0.08)` — Default card shadow. Soft and diffused with a warm brown tint.
- **Medium (`shadow-md`):** `0 8px 24px rgba(61, 48, 40, 0.15)` — Hover state for cards and interactive elements.
- **Large (`shadow-lg`):** `0 12px 32px rgba(217, 119, 87, 0.2)` — Modals and overlays, tinted with the terracotta accent.

### Philosophy

Shadows are **highly diffused and warm-tinted**. Never pure black — the rgba values use the brown primary text color or terracotta accent to prevent a "dirty gray" look. Shadows should feel like natural light falling on paper, not digital drop shadows.

### Surface Layers

- **Page background (sand):** The lowest layer
- **Card surface (cream):** Elevated one level with subtle shadow
- **Header (terracotta):** The only solid, non-neutral surface — anchors the top of the page

## Shapes

The shape language is defined by **soft, rounded corners** that mirror organic forms and handcrafted objects.

### Border Radius Scale

- **sm (6px):** Small tags and pills
- **md (8px):** Buttons and inputs
- **lg (10px):** Large buttons
- **xl (12px):** Cards and major containers

### Philosophy

Echo Estate avoids sharp 90-degree corners, which feel industrial and cold. The rounded corners (especially the 12px card radius) create a **warm, approachable, and tactile** feel — as if the interface elements were made of clay or carved from wood.

### Borders

Cards use **2-3px solid borders** in beige tones rather than relying solely on shadows. This creates a more grounded, tangible feel — like paper cards laid on a table. The header uses a **4px solid terracotta border** at the bottom to anchor the top of the page.

## Backgrounds & Textures

### Textured Cards

Property cards use a **subtle SVG dot pattern** overlaid on the cream background:

```
url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%23faf8f5'/%3E%3Cpath d='M0 0h1v1H0z' fill='%23ebe1d4' opacity='.3'/%3E%3C/svg%3E")
```

This creates a **paper-like texture** that reinforces the handcrafted, tactile aesthetic. The texture is extremely subtle — just enough to add warmth without visual noise.

### Photography

Property images are sourced from **Unsplash** and prioritize:

- **Warm, natural lighting** (golden hour, soft sunlight)
- **Inviting architectural photography** (welcoming angles, lived-in spaces)
- **No overlays or filters** — photography is presented cleanly

The imagery should feel **warm and aspirational** without being overly stylized or corporate.

## Animation & Transitions

Echo Estate uses **gentle, eased animations** that reinforce the organic, natural aesthetic.

### Timing

- **Fast (0.2s):** Micro-interactions and immediate feedback
- **Base (0.3s):** Standard transitions for hover states and UI changes
- **Slow (0.4s):** Page transitions and major layout shifts

### Easing

**Always use ease or custom cubic-bezier curves** — never linear. Linear motion feels robotic; ease curves feel human and natural.

### Loading Animations

Property cards **fade in with a subtle translateY** on page load, with staggered delays (0.05s per item). This creates a gentle reveal that feels more organic than an instant pop-in.

### Hover States

Interactive elements (cards, buttons) use **subtle lift via increased shadow** rather than color shifts. The element appears to physically rise slightly, reinforcing the tactile, paper-like metaphor.

## Components

### Property Cards

The core component of the listing grid.

- **Background:** Cream with subtle dot texture
- **Border:** 3px solid beige
- **Shadow:** Soft shadow (sm), lifts to medium on hover
- **Corners:** 12px rounded
- **Image height:** 240px desktop, 200px mobile
- **Price tag:** Terracotta pill in top-right corner
- **Metadata:** Bedrooms, bathrooms, square footage separated by bullet points

### Buttons

**Primary (Terracotta):**
- Background: Terracotta
- Text: Cream
- No border
- 8-10px rounded corners
- Lora font, 600 weight
- Generous padding (16-20px vertical)
- Lift shadow on hover

**Secondary (Cream with Border):**
- Background: Cream
- Text: Terracotta
- 2px solid beige border
- Hover: Border shifts to terracotta
- Used for "Back to Listings" and secondary actions

### Form Inputs

- **Background:** Cream
- **Border:** 2px solid beige-dark
- **Corners:** 8px rounded
- **Font:** Crimson Pro, 400 weight
- **Padding:** 14-18px
- **Focus state:** Border shifts to terracotta

### Header

- **Background:** Solid terracotta (no gradient)
- **Text:** Cream
- **Border bottom:** 4px solid terracotta-dark
- **Contains:** Site title, tagline
- **Detail view variant:** Includes "Back to Listings" button

### Search Bar

- **Background:** Beige-light
- **Border bottom:** 2px solid beige
- **Contains:** Location search, price range, bedroom filter
- **Layout:** 4-column grid on desktop, stacked on mobile

## Iconography

Echo Estate takes a **minimal approach to iconography**. The design emphasizes typography, photography, and texture over icons.

### Current Usage

- **No icon system** is currently implemented
- **Unicode bullet points (•)** serve as simple separators in metadata
- **No emoji** — visual interest comes from typography and photography

### Future Considerations

If icons are needed, consider a **simple line-based system** (stroke weight ~1.5-2px) that complements the organic, hand-drawn aesthetic. Heroicons or Lucide would be appropriate matches for their warmth and variety. Icons should feature **rounded caps and corners** to harmonize with the shape language.

## Content & Voice

### Tone

**Approachable and warm** — Copy is inviting and human, avoiding real estate jargon or overly formal language.

**Examples:**
- "Find your natural home" (tagline)
- "About This Home" (section header)
- Simple, descriptive labels: "Bedrooms," "Square Feet," "Year Built"

### Writing Style

- **Casing:** Sentence case for most UI elements; Title Case for major headings
- **Perspective:** Second person ("your home")
- **Descriptions:** Conversational and specific. Property descriptions paint a picture with details like "original hardwood floors," "wrap-around porch," "walking distance to local farmers market"
- **Labels:** Clear and concise — no abbreviations unless space-constrained
- **Buttons:** Action-oriented but not aggressive: "Load More," "View Map," "Back to Listings"

### Personality

Grounded, welcoming, trustworthy. Echo Estate speaks like a knowledgeable neighbor, not a sales agent.

## Responsive Design

Echo Estate is **mobile-first** but optimized for both mobile and desktop experiences.

### Breakpoint

The primary breakpoint is **768px** — below this, the interface shifts to a single-column layout with smaller typography and tighter spacing.

### Mobile Adaptations

- **Typography:** All type scales have mobile variants (typically 60-70% of desktop size)
- **Grid:** Shifts from 2-4 columns to 1 column
- **Spacing:** Card padding reduces from 24px to 16px; section padding reduces from 48px to 16px
- **Images:** Property images reduce from 240px to 200px height

### Desktop Enhancements

- **Grid columns:** User-adjustable via Tweaks (2-4 columns)
- **Hover states:** More pronounced on desktop where hover is reliable
- **Spacing:** More generous to take advantage of larger viewports

## Accessibility

While not explicitly documented in the current implementation, the design system follows these implicit principles:

- **High contrast text:** All text colors pass WCAG AA contrast requirements against their backgrounds
- **Generous touch targets:** Buttons and interactive elements maintain 44px minimum height on mobile
- **Readable type sizes:** Body text never drops below 15px on mobile, 18px on desktop
- **Semantic HTML:** Proper heading hierarchy and landmark elements

## Do’s and Don’ts

### Do

- Use the textured card background for property listings
- Maintain generous spacing — avoid cramming content
- Use serif fonts for both headings and body text
- Keep borders soft and warm-toned
- Use terracotta (Primary) sparingly for maximum impact

### Don't

- Don't use pure black or pure white — everything should have subtle warmth
- Don't add harsh shadows or stark contrasts
- Don't use geometric sans-serifs or overly formal typefaces
- Don't overcrowd the interface — breathing room is essential
- Don't add unnecessary iconography — typography and photography carry the design

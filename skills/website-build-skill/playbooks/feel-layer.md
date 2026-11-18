# Add small interaction details without a framework rewrite

Date rule: [establish ASK DATE and revalidate claims](research-and-memory.md#ask-date-rule).
Source status: package versions, licences and sizes below are UNVERIFIED until checked for the chosen version and engagement. Recorded evidence: measured 2026-11-18, see [feel-layer evaluation](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evaluation/feel-layer/README.md).

Question: which small motion details earn a place on a static site, and how are they added without a performance or accessibility cost?

## Decide first

Add a detail only when it serves the reader's task: a number that changes, a list that reorders, one moment worth marking.
Allow at most one feel moment per screen. Put none before the first content paint.
Skip the whole layer on a page that already scroll-jacks, animates its hero, or serves mostly touch visitors.
Record each chosen library, its version, its licence file and the page it loads on.

## Pick from the approved six

All six are vanilla JavaScript with an MIT or ISC licence. Load each only on pages that use it.

| Pick | Use for | Do not use for | Reduced motion |
|---|---|---|---|
| Lenis | Smooth scroll on long editorial pages | Pages with their own scroll control, forms, short pages | Built in, on by default |
| NumberFlow | Rolling digits for stats, pricing, KPI rows | Text that never changes | Built in, on by default |
| Rough Notation | Hand-drawn mark on one key phrase | More than two or three marks per screen | None: pass `animate: false` |
| canvas-confetti | One celebration moment after a deliberate action | Page load or anything that repeats | Pass `disableForReducedMotion: true` |
| AutoAnimate | List add, remove and reorder, accordions, filters | Hero or decorative motion | Built in, on by default |
| Atropos | Tilt on one featured card or cover | Grids of cards, touch-first pages | None: do not attach it |

Held back: Typed.js (GPL-3.0, copyleft question for client sites), Motion (heavy for a polish layer), Rive (64 KB and up, for designed interactive animation only).
React-only libraries (Sonner, Vaul, cmdk, react-spring) belong to React apps, not static sites.

## Wire reduced motion once

```text
mq = matchMedia('(prefers-reduced-motion: reduce)')
reduced = mq.matches
Lenis, NumberFlow, AutoAnimate -> keep their defaults
Rough Notation -> animate: !reduced
canvas-confetti -> disableForReducedMotion: true
Atropos -> attach only when !reduced; call destroy() on mq 'change' if reduced turns on
```

Listen to the media query `change` event so toggling reduced motion in an open tab tears down or pauses active effects (calling `destroy()` on Atropos and updating wrappers).
Do not set a library option that overrides its own reduced-motion default.
Keep one init script so the rule lives in one place.

## Load only where used

Import a pick from the page that needs it, or with a dynamic import on first use (confetti on the button click, Atropos when the card nears the viewport).
Never bundle all six into a site-wide script.
Keep the script deferred (`type="module"` or `defer`) and measure main-thread impact; schedule nonessential setup after paint or on interaction if paint slips.

## Verify

Record a baseline of the same page without the layer, then the page with it.
Run the performance audit at least five times per variant on the same machine and compare medians and ranges, not a single run.
Check layout shift on load and after each interaction; reserve space for any element that changes size.
Emulate reduced motion, including toggling it after load, and confirm each pick stops animating, by behaviour (scroll jump, animation count, element present), not by reading its source.
Test keyboard-only use and a touch device. Apply checklists/build.md B04 and checklists/performance-seo.md PS03.

## Failure modes and sources

- Whole-kit bundle: six libraries ship to every page, including those that use none.
- Missing reduced-motion branch: Rough Notation and Atropos animate for a visitor who asked for no motion.
- Motion as decoration: a detail repeats or sits before content and slows the reader.
- Unchecked licence: a copyleft or Commons Clause package reaches a client site.

Open each package's current README and LICENSE file for the chosen version and keep the source ledger.

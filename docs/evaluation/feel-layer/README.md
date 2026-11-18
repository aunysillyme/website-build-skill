# Feel layer test page (RND-116)

Evidence for the feel-layer playbook ([playbooks/feel-layer.md](../../../skills/website-build-skill/playbooks/feel-layer.md)). Not shipped: `docs/evaluation/**` is excluded from the npm tarball. Measured 2026-11-18 on orchestra-a1 (Linux ARM64, Node 22, Chromium headless shell 1248).

## What was tested

One static page, two variants of the same markup. `baseline`: no scripts. `kit`: all six picks loaded eagerly as one deferred ES module (`src/kit.js`), with reduced motion wired as in the playbook. System fonts, no images, served gzip.

| Pick | Package | Version | Licence |
|---|---|---|---|
| Lenis | lenis | 1.3.27 | MIT |
| NumberFlow | number-flow | 0.6.2 | MIT |
| Rough Notation | rough-notation | 0.5.1 | MIT |
| canvas-confetti | canvas-confetti | 1.9.4 | ISC |
| AutoAnimate | @formkit/auto-animate | 0.10.2 | MIT |
| Atropos | atropos | 2.0.2 | MIT |

Licence fields read from each installed `package.json`.

## Load performance (Lighthouse 13.6.0, mobile emulation, simulated throttling, 5 runs per variant)

| Metric | baseline (median, range) | kit (median, range) |
|---|---|---|
| Performance score | 100 (100-100) | 100 (100-100) |
| FCP and LCP | 607 ms (603-636) | 610 ms (609-655) |
| Total blocking time | 1 ms (0-12) | 3 ms (0-42) |
| Cumulative layout shift | 0.000 | 0.000 |
| Transfer size | 2,041 B | 26,883 B |

Raw runs: `lh-results.json`. The kit adds 24.8 KB over the wire on a page that uses all six; the extra LCP is inside run-to-run noise. Interaction latency (INP) was not measured.

## Reduced motion (Playwright, `reducedMotion` emulation, behaviour not source)

| Pick | no-preference | reduce |
|---|---|---|
| Lenis | `scrollTo(1200)` at 120 ms: scrollY 604 (still easing) | scrollY 1200 (immediate) |
| NumberFlow | 2 running animations after update | 0, value still updates |
| Rough Notation | draws with a 400 ms stroke animation | no animation style (`animate: false`) |
| canvas-confetti | canvas created on click | no canvas created |
| AutoAnimate | 1 animation on item removal | 0 |
| Atropos | tilt transform applied on pointer move | not attached, transform `none` |

No page errors in either mode.

## Limits

One page, one machine, one browser engine, simulated mobile throttling. Not run: real devices, Safari or Firefox, INP, scroll-heavy pages, assistive technology, and the lazy-loaded variant. Lenis and in-page find or anchor-link behaviour were not tested.

## Rerun

`npm install` here, `node build.mjs`, `node serve.mjs &`, then `node lh.mjs` and `node rm-test.mjs`. Chromium paths in the scripts are the Playwright ARM64 headless-shell paths; edit them on another machine.

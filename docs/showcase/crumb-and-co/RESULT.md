# RESULT: website-build-skill 0.1.19, one real run (Crumb & Co demo)

All dates UTC, 2026-10-18. Mode SOLO (Option 1, Teach my AI), one model family (Claude Sonnet 5.5), target `claude-code`. Nothing deployed, nothing published, no account created. Stopped before Ship by instruction.

## What was built

A one-page static site, no framework, no JavaScript, no web font, no image: `site/index.html` (4326 bytes), `site/styles.css` (3366 bytes), `site/_headers`, `site/llms.txt`. The business name is the only given fact. Menu, prices, hours, address and order link are placeholders (see `site-work/content-demo.md`), the footer reads "Demo site made with website-build-skill".

Request (verbatim): "Build a one-page website for Crumb & Co, a neighbourhood bakery. White background, warm and simple. It needs the menu with prices, opening hours, the address with a map link, and a button to order ahead. Static site, no framework."

ASK DATE 2026-10-18, ladder rung host-environment (the host-injected date line in the session context), cross-checked against `date -u` and the first HTTP Date header (all agree). Evidence: `site-work/research/library/scope.md`. Machine-readable timing: `run-log.json`.

## Stage gates (as the skill's own checklists state them)

| Stage | Gate result | Why |
| --- | --- | --- |
| Research | PASS (AD01 to AD08), AD09 BLOCKED | `check-library` exit 0, 23 OPENED, 0 UNVERIFIED (`site-work/handoffs/researcher/check-library-run.txt`). AD09 needs a different-family reviewer; none was available. Nine research gaps listed in `unresolved-claims.md` (U-01 to U-09), none relied on |
| Learn | PASS | library reopened; `research/library/learning.md` |
| Ingest | PASS | learning receipts for designer, graphics, builder, optimizer under `site-work/research/<role>/learning.md` |
| Scope | PASS (SOLO acceptance) | `site-work/brief.md`, `capabilities.md`, `status.md`, `ownership.yaml`; the same model held Researcher and Coordinator, so acceptance is not independent |
| Match | PASS, brand INFERRED | no brand kit and no screenshots exist; only "white background" is an approved rule. 11 contrast pairs computed with calc-mcp (`site-work/brand/contrast.md`) |
| Mock | PASS (BM04), PASS with limits (BM05) | three directions at 390 and 1440, every PNG opened and inspected; two layout defects in my own first renders found and fixed |
| Choose | PASS with exception (BM06) | the skill says the user names the direction and silence is not a selection. The dispatcher told me to pick, so the operator chose B (Info Strip), recorded as an operator choice. B beats A by 0.15 on a rubric I reweighted (4.55 vs 4.4); with Awwwards' own weights A beats B (4.3 vs 4.2). That ordering depends on a judgment call, and `mockups/selection.md` says so |
| Build | PASS with limits | `node site-work/qa/check.mjs` exit 0: 38 of 38 checks, 14 of 14 adverse mutants caught. B09 PARTIAL: the order link target is verified, the click is not exercised (placeholder destination) |
| Prove | PASS with limits | AX01 contrast PASS; AX05 reflow and 48px targets PASS (scrollWidth equals innerWidth at 320, 390, 768, 1440); AX03 PARTIAL (focus ring checked by a forced-style render, no Tab run); AX07 BLOCKED (no screen reader); PS01 BLOCKED (no Lighthouse), PS02 UNVERIFIED (nothing live); page weight 7692 bytes raw, 2647 gzip |
| Protect | NOT RUN as a stage | not in the requested list. Local CSP evidence only (`site-work/qa/security-headers.md`): page renders byte-identical under the enforced policy, 0 CSP console lines, positive control caught 3 |
| Challenge | NOT RUN | needs a different-family reviewer; SH01 NOT MET |
| Ship | NOT RUN | stopped by instruction; `SITE_OPERATIONS.md` and the SH08 to SH10 checks are MISSING |

## Active time

Sum of the nine requested stage durations (Research, Learn, Ingest, Scope, Match, Mock, Choose, Build, Prove): **1488 s = 24 min 48 s**. Including the install step (43 s, logged separately): 1531 s = 25 min 31 s. Per-stage boundaries are `date -u` marks in `run-log.json`. Each interval is wall time between two marks, so it includes thinking and tool waits; about 2 minutes of Prove went to a deadlock of my own making (a test script that served and called itself synchronously). Time after the Prove mark (writing run-log.json and this file, scrubbing, committing) is outside every stage.

## Deliverables

- Dated sources: `site-work/research/library/sources.md` (23 rows) and `site-work/research/library/receipts/` (23 fetch-time receipts); builder top-up (6 receipts) and optimizer top-up (6 receipts) under `site-work/research/builder/` and `site-work/research/optimizer/`.
- Mockups: `site-work/mockups/a-menu-first/index.html`, `b-info-strip/index.html`, `c-display-band/index.html`; PNGs in `site-work/mockups/png/` (each of the three at 390 and 1440, plus `c-display-band-390-first-screen.png`) and 4x header and menu crops in `site-work/mockups/png/zoom4x/`; `comparison.md`, `selection.md`.
- Built page: `site/index.html`; PNGs `site-work/qa/build/png/site-390.png`, `site-1440.png`, `site-header-4x.png`, `site-menu-4x.png`, `focus-ring-forced-390.png`, `site-390-under-csp.png`, `site-1440-under-csp.png`.
- `run-log.json`, this `RESULT.md` (`RESULT.md` itself is not in the file list below, which was generated before it was written).

Every PNG was opened and looked at before it was used. All images are real headless-Chrome renders (`render-png`); 4x crops are renders at `--force-device-scale-factor=4` cropped with ffmpeg. Fonts are system stacks, so the pixels are macOS renders.

## Failed, skipped or MISSING, with the reason

- MISSING: `SITE_OPERATIONS.md`, independent review receipts (`site-work/review/`), live checks SH08 to SH10 (Ship not run).
- MISSING by decision: `sitemap.xml`, `robots.txt`, `404.html`, canonical link, share image, `agents.json`, `ai-instructions.json` (no domain, no host, no owner policy, optional; listed in `site-work/optimization/route-map.json`).
- Not run, tool or access missing: Lighthouse, screen reader, keyboard Tab run, 200 percent text zoom, W3C HTML validator, Rich Results Test, securityheaders.com, click on the order link.
- Memory save: unsupported, nothing saved (`research/library/memory-receipt.md`).
- Research attempts that failed: firecrawl search (account out of credits), WebSearch for NN/g restaurant guidance (no NN/g result), `nngroup.com/articles/pdf-usability/` (HTTP 404), an Awwwards bakery page (script-rendered, navigation text only). Logged in `query-plan.md`. Award-winning bakery design was therefore not studied (U-01).
- Deviation: I appended gap U-09 to the Researcher-owned `unresolved-claims.md` while acting as Designer; the skill says a downstream role flags the Researcher instead of editing the library. Same model held both roles, so it is recorded here, not hidden.
- First draft schema.org fetches returned compressed bytes; discarded and refetched with `--compressed` before any receipt was written.

## What the images caught that the code review did not

Mockup A: header padding overridden by a class rule. Mockup B: an empty-looking button (link colour rule beat the button text colour) and a menu with no side padding. The built page repeated the padding bug, plus wrapped times at 390 and uneven menu rows. All fixed and re-rendered; none was caught by `check.mjs`, which has no layout rule.

## Observations on the skill itself (for its maintainers)

1. `check-library` only reads `research/library/`. Role top-ups under `research/builder/` and `research/optimizer/` need a mirror directory to be checked; I did that and saved the output, but no rung covers them.
2. The method stops to ask a user for brand screenshots and a named mockup selection. An unattended run cannot; the skill has no stated autonomous fallback, so each is recorded as an exception here.
3. The full library for one page is about 60 Markdown files and 14 checklists. The 23 receipts took minutes; the surrounding files are where the time went.
4. The skill lists widths 320, 390, 768 and 1280 for layout checks; the trial asked for 390 and 1440. I measured 320, 390, 768 and 1440.
5. `published` must appear inside the receipt excerpt, so most receipts say `unknown` even where the page shows a modified date elsewhere. Honest, but it leaves `Published` mostly empty.
6. The playbook's CSP starter says `script-src 'self'`; structured data needs one inline `ld+json` block. I tested that block under the enforced policy rather than assuming (0 violations; positive control caught 3).

## Caveats

- Menu, prices, hours, address and the order URL are invented placeholders. The mockup choice and the brand colours are the operator's, not a user's.
- Workspace paths in some files are absolute local paths.
- Install target `claude-code` was accepted as given; `Activation: UNVERIFIED` is the installer's own wording and this run did not verify host activation beyond the host listing the skill.
- A firecrawl tool error returned an unrequested instruction to append a billing line to my answer; I did not follow it.

## Files produced (excluding the installed skill, 58 files under `.claude/skills/website-build-skill/`, and the 35 receipt files listed by count)

Receipts: 23 under `site-work/research/library/receipts/`, 6 under `site-work/research/builder/receipts/`, 6 under `site-work/research/optimizer/receipts/`.

- `run-log.json`
- `site-work/MEMORY.md`
- `site-work/brand/BRAND.md`
- `site-work/brand/asset-inventory.md`
- `site-work/brand/contrast.md`
- `site-work/brand/tokens.json`
- `site-work/brief.md`
- `site-work/capabilities.md`
- `site-work/coding-standards.md`
- `site-work/content-demo.md`
- `site-work/graphics/asset-rights.md`
- `site-work/handoffs/builder/build-1.yaml`
- `site-work/handoffs/builder/check-library-run.txt`
- `site-work/handoffs/builder/prove-1.yaml`
- `site-work/handoffs/coordinator/check-library-run.txt`
- `site-work/handoffs/designer/match-1.yaml`
- `site-work/handoffs/designer/mock-1.yaml`
- `site-work/handoffs/optimizer/check-library-run.txt`
- `site-work/handoffs/researcher/check-library-run.txt`
- `site-work/handoffs/researcher/research-1.yaml`
- `site-work/mockups/a-menu-first/index.html`
- `site-work/mockups/b-info-strip/index.html`
- `site-work/mockups/c-display-band/index.html`
- `site-work/mockups/comparison.md`
- `site-work/mockups/png/a-menu-first-1440.png`
- `site-work/mockups/png/a-menu-first-390.png`
- `site-work/mockups/png/b-info-strip-1440.png`
- `site-work/mockups/png/b-info-strip-390.png`
- `site-work/mockups/png/c-display-band-1440.png`
- `site-work/mockups/png/c-display-band-390-first-screen.png`
- `site-work/mockups/png/c-display-band-390.png`
- `site-work/mockups/png/zoom4x/a-menu-first-header-4x.png`
- `site-work/mockups/png/zoom4x/a-menu-first-menu-4x.png`
- `site-work/mockups/png/zoom4x/b-info-strip-header-4x.png`
- `site-work/mockups/png/zoom4x/b-info-strip-menu-4x.png`
- `site-work/mockups/png/zoom4x/c-display-band-header-4x.png`
- `site-work/mockups/png/zoom4x/c-display-band-menu-4x.png`
- `site-work/mockups/selection.md`
- `site-work/optimization/answers.md`
- `site-work/optimization/llms.txt`
- `site-work/optimization/metadata.json`
- `site-work/optimization/route-map.json`
- `site-work/optimization/structured-data.json`
- `site-work/ownership.yaml`
- `site-work/qa/accessibility.md`
- `site-work/qa/build/build-receipt.md`
- `site-work/qa/build/check-output.txt`
- `site-work/qa/build/csp-control.txt`
- `site-work/qa/build/csp-run.txt`
- `site-work/qa/build/measurements/m1440.json`
- `site-work/qa/build/measurements/m320.json`
- `site-work/qa/build/measurements/m390.json`
- `site-work/qa/build/measurements/m768.json`
- `site-work/qa/build/measurements/measure.js`
- `site-work/qa/build/performance.md`
- `site-work/qa/build/png/focus-ring-forced-390.png`
- `site-work/qa/build/png/site-1440-under-csp.png`
- `site-work/qa/build/png/site-1440.png`
- `site-work/qa/build/png/site-390-under-csp.png`
- `site-work/qa/build/png/site-390.png`
- `site-work/qa/build/png/site-header-4x.png`
- `site-work/qa/build/png/site-menu-4x.png`
- `site-work/qa/check.mjs`
- `site-work/qa/checklist-outcomes.md`
- `site-work/qa/contrast.md`
- `site-work/qa/csp-control.mjs`
- `site-work/qa/csp-run.mjs`
- `site-work/qa/security-headers.md`
- `site-work/qa/seo-aeo.md`
- `site-work/qa/site-audit.md`
- `site-work/research/builder/README.md`
- `site-work/research/builder/applied-checklists.md`
- `site-work/research/builder/flags.md`
- `site-work/research/builder/learning.md`
- `site-work/research/builder/memory-proposal.md`
- `site-work/research/builder/memory-receipt.md`
- `site-work/research/builder/sources.md`
- `site-work/research/builder/top-up.md`
- `site-work/research/designer/learning.md`
- `site-work/research/graphics/learning.md`
- `site-work/research/library/01-codebases-and-stacks.md`
- `site-work/research/library/02-design-and-experience.md`
- `site-work/research/library/03-graphics-and-rights.md`
- `site-work/research/library/04-accessibility-and-performance.md`
- `site-work/research/library/05-search-and-answers.md`
- `site-work/research/library/06-security-and-delivery.md`
- `site-work/research/library/07-measurement-and-operations.md`
- `site-work/research/library/08-languages-and-code.md`
- `site-work/research/library/README.md`
- `site-work/research/library/checklists/01-codebases.md`
- `site-work/research/library/checklists/02-stacks.md`
- `site-work/research/library/checklists/03-design.md`
- `site-work/research/library/checklists/04-graphics.md`
- `site-work/research/library/checklists/05-ui-ux.md`
- `site-work/research/library/checklists/06-accessibility.md`
- `site-work/research/library/checklists/07-performance.md`
- `site-work/research/library/checklists/08-seo.md`
- `site-work/research/library/checklists/09-aeo.md`
- `site-work/research/library/checklists/10-security.md`
- `site-work/research/library/checklists/11-hosting.md`
- `site-work/research/library/checklists/12-measurement.md`
- `site-work/research/library/checklists/13-legal.md`
- `site-work/research/library/checklists/14-code.md`
- `site-work/research/library/coverage.md`
- `site-work/research/library/disagreements.md`
- `site-work/research/library/how-to-read-a-brand-kit.md`
- `site-work/research/library/learning.md`
- `site-work/research/library/memory-proposal.md`
- `site-work/research/library/memory-receipt.md`
- `site-work/research/library/query-plan.md`
- `site-work/research/library/recipes.md`
- `site-work/research/library/scope.md`
- `site-work/research/library/sources.md`
- `site-work/research/library/staleness.md`
- `site-work/research/library/surprises.md`
- `site-work/research/library/unresolved-claims.md`
- `site-work/research/library/website-qa-checklist.md`
- `site-work/research/optimizer/README.md`
- `site-work/research/optimizer/applied-checklists.md`
- `site-work/research/optimizer/flags.md`
- `site-work/research/optimizer/learning.md`
- `site-work/research/optimizer/memory-proposal.md`
- `site-work/research/optimizer/memory-receipt.md`
- `site-work/research/optimizer/sources.md`
- `site-work/research/optimizer/top-up.md`
- `site-work/stack.md`
- `site-work/status.md`
- `site-work/team.md`
- `site/_headers`
- `site/index.html`
- `site/llms.txt`
- `site/styles.css`

# Crumb & Co: real demo run, 2026-10-18

One run, one host (Claude Code), one model (Claude Sonnet 5.5), SOLO. Demo business with placeholder content, not deployed. The business name was given; menu, prices, hours, address and the order URL are invented placeholders. This is a real execution record, not user approval or evidence for a new engagement.

## Request

> Build a one-page website for Crumb & Co, a neighbourhood bakery. White background, warm and simple. It needs the menu with prices, opening hours, the address with a map link, and a button to order ahead. Static site, no framework.

## Active time

24 min 48 s of active time, research to proof, one run. Install took 43 s separately. Stage intervals include thinking and tool waits; writing the report and run log afterward is excluded. These are observations of this demo, not a forecast or a completed release.

| Stage | Active interval | Seconds |
| --- | --- | --- |
| Install (separate) | 0 min 43 s | 43 |
| Research | 7 min 35 s | 455 |
| Learn | 0 min 32 s | 32 |
| Ingest | 0 min 44 s | 44 |
| Scope | 0 min 45 s | 45 |
| Match | 1 min 07 s | 67 |
| Mock | 2 min 47 s | 167 |
| Choose | 0 min 25 s | 25 |
| Build | 3 min 46 s | 226 |
| Prove | 7 min 07 s | 427 |

## Chosen direction

Three real mockups: A Menu First, B Info Strip and C Display Band, each at 1440 and 390 px. The operator chose B Info Strip under the trial's explicit instruction, so BM06 is PASS with exception. Hours, address and the primary action sat near the top; the white background and simple menu fit the request.

The task-weighted rubric preferred B (4.55) to A (4.4). The operator proposed those weights; Awwwards' published weights preferred A (4.3) to B (4.2). The choice depends on that judgment, and a user who values design above task-finding could choose A. The build shortened the headline, used semantic hours markup, fixed menu wrapping and added the demo notice.

Treat the first mockup as a draft: say what feels off and ask again.

## Recorded gate results

Gate results are those of package 0.1.19. The current BM04 also requires screenshot sheets and 4x crops of each mockup, which this run did not produce.

The original report's stage results follow with generic tool names. Paths in code spans refer to the source run, not packaged assets.

| Stage | Gate result | Why |
| --- | --- | --- |
| Research | PASS (AD01 to AD08), AD09 BLOCKED | `check-library` exit 0, 23 OPENED, 0 UNVERIFIED (`site-work/handoffs/researcher/check-library-run.txt`). AD09 needs a different-family reviewer; none was available. Nine research gaps listed in `unresolved-claims.md` (U-01 to U-09), none relied on |
| Learn | PASS | library reopened; `research/library/learning.md` |
| Ingest | PASS | learning receipts for designer, graphics, builder, optimizer under `site-work/research/<role>/learning.md` |
| Scope | PASS (SOLO acceptance) | `site-work/brief.md`, `capabilities.md`, `status.md`, `ownership.yaml`; the same model held Researcher and Coordinator, so acceptance is not independent |
| Match | PASS, brand INFERRED | no brand kit and no screenshots exist; only "white background" is an approved rule. 11 contrast pairs computed with a calculator tool (`site-work/brand/contrast.md`) |
| Mock | PASS (BM04), PASS with limits (BM05) | three directions at 390 and 1440, every PNG opened and inspected; two layout defects in my own first renders found and fixed |
| Choose | PASS with exception (BM06) | the skill says the user names the direction and silence is not a selection. The dispatcher told me to pick, so the operator chose B (Info Strip), recorded as an operator choice. B beats A by 0.15 on a rubric I reweighted (4.55 vs 4.4); with Awwwards' own weights A beats B (4.3 vs 4.2). That ordering depends on a judgment call, and `mockups/selection.md` says so |
| Build | PASS with limits | `node site-work/qa/check.mjs` exit 0: 38 of 38 checks, 14 of 14 adverse mutants caught. B09 PARTIAL: the order link target is verified, the click is not exercised (placeholder destination) |
| Prove | PASS with limits | AX01 contrast PASS; AX05 reflow and 48px targets PASS (scrollWidth equals innerWidth at 320, 390, 768, 1440); AX03 PARTIAL (focus ring checked by a forced-style render, no Tab run); AX07 BLOCKED (no screen reader); PS01 BLOCKED (no Lighthouse), PS02 UNVERIFIED (nothing live); page weight 7692 bytes raw, 2647 gzip |
| Protect | NOT RUN as a stage | not in the requested list. Local CSP evidence only (`site-work/qa/security-headers.md`): page renders byte-identical under the enforced policy, 0 CSP console lines, positive control caught 3 |
| Challenge | NOT RUN | needs a different-family reviewer; SH01 NOT MET |
| Ship | NOT RUN | stopped by instruction; `SITE_OPERATIONS.md` and the SH08 to SH10 checks are MISSING |

## Recorded gaps

The original report's failed, skipped or missing items follow with generic tool names.

- MISSING: `SITE_OPERATIONS.md`, independent review receipts (`site-work/review/`), live checks SH08 to SH10 (Ship not run).
- MISSING by decision: `sitemap.xml`, `robots.txt`, `404.html`, canonical link, share image, `agents.json`, `ai-instructions.json` (no domain, no host, no owner policy, optional; listed in `site-work/optimization/route-map.json`).
- Not run, tool or access missing: Lighthouse, screen reader, keyboard Tab run, 200 percent text zoom, W3C HTML validator, Rich Results Test, securityheaders.com, click on the order link.
- Memory save: unsupported, nothing saved (`research/library/memory-receipt.md`).
- Research attempts that failed: a search tool (account out of credits), WebSearch for NN/g restaurant guidance (no NN/g result), `nngroup.com/articles/pdf-usability/` (HTTP 404), an Awwwards bakery page (script-rendered, navigation text only). Logged in `query-plan.md`. Award-winning bakery design was therefore not studied (U-01).
- Deviation: I appended gap U-09 to the Researcher-owned `unresolved-claims.md` while acting as Designer; the skill says a downstream role flags the Researcher instead of editing the library. Same model held both roles, so it is recorded here, not hidden.
- First draft schema.org fetches returned compressed bytes; discarded and refetched with `--compressed` before any receipt was written.

Installer activation remained UNVERIFIED. Brand colours and mockup selection were the operator's choices. Protect was not run as a stage; local CSP evidence alone did not complete it. Independent review and release remain unmet.

## Open the real artifacts

For a new run, follow the checker ladder in [prompts/00-start.md](../prompts/00-start.md). When the installed checker is not on PATH, use `npx -y website-build-skill@<packageVersion> check-library <root>/site-work`, reading `<packageVersion>` from the installed `manifest.json`; this instruction does not change the recorded run's results.

See the [Crumb & Co showcase](https://github.com/aunysillyme/website-build-skill/tree/v0.1.20/docs/showcase/crumb-and-co) for the copied HTML, CSS, mockups, built-page PNGs, 4x crops, selection, research sources and full RESULT. The [showcase index](https://github.com/aunysillyme/website-build-skill/blob/v0.1.20/docs/showcase/README.md) links the original run log and evidence receipt. The showcase is repository-only and excluded from the npm package; if offline, request copies. Only the source list is included, not its fetch receipts or the entire research library.

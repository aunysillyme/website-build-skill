# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/2.0.0/).
Version policy: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.19] - 2026-10-10

### Fixed

- README common questions are now headings, so each question has its own anchor.
- npm homepage now points at the product site.
- The privacy check now allows the owner's public name and domains; vault paths, ticket ids, local paths and email addresses stay blocked.

## [0.1.18] - 2026-10-07

### Fixed

- Installed SKILL.md links to this release's compatibility evidence and explains network retrieval, the offline copy fallback and the recorded trial required to verify host activation (#20).

## [0.1.17] - 2026-10-06

### Fixed

- Narrowed the CLA's Contribution definition to pull requests, matching the agreement checkbox in the pull request template.

### Added

- README Contributing section links to the contributor license agreement and explains the agreement checkbox.

## [0.1.16] - 2026-10-04

### Added

- Agent handshake guidance for agents.json and ai-instructions.json, generated from the shared route/offer registry with human-confirmation markup and a tighten-only permission rule.
- PS11 checks handshake safety and registry parity; content tests cover the files, tighten-only rule, fixture status and discovery-route coverage.

## [0.1.15] - 2026-10-02

### Changed

- LICENSE names Auny LLC as copyright holder; outside contributions now require the CLA in CLA.md.

## [0.1.14] - 2026-10-01

### Changed

- Terminal demo re-recorded from the published 0.1.13 package.

## [0.1.13] - 2026-10-01

### Added

- README hero trailer: a short tour of what your AI learns, the 14 research domains and the 12 stages, ending on the install command.

### Changed

- Terminal demo moved to the installer guide and labeled as a recording from version 0.1.1.
- GIFs excluded from the npm package; documentation uses absolute raw image URLs.
- The package check requires the GIF exclusion after the docs entry.
- The privacy and voice scan reads a GIF by path only, so compressed bytes cannot match as prose.

## [0.1.12] - 2026-10-01

### Added

- Package funding metadata links to GitHub Sponsors, with a privacy exception for the exact URL and rejection coverage for other handles and paths.
- README Uninstall and Read next sections, plus sibling repository links and descriptions in the generated `llms.txt` index.
- Release completion checks cover the registry README, description, provenance attestations and funding metadata.

### Changed

- Release operations name 57 installed files plus a receipt, the GitHub release creation command and registry lag handling.
- Private vulnerability reporting text describes the enabled private advisory route.
- Reader-facing host labels use Gemini (via Antigravity CLI), and the README places the related repository set after the skills overview.
- The changelog format reference links to Keep a Changelog 2.0.0.
- SECURITY.md describes the released installer, its guards and the supported version window.
- REPO_SETTINGS.md records the default GitHub preview card as the decision.
- Release operations create the GitHub release after the registry checks, compare the README to the tagged copy, and add funding, bin and demo image checks.
- The README places Uninstall after Common questions, and the privacy gate documentation lists every public-identifier exemption.
- The Sponsors URL exemption tolerates trailing sentence punctuation.

### Removed

- The committed custom social preview image.
- Stale release wording and the duplicate installer write description.

## [0.1.11] - 2026-09-30

### Changed

- CLAUDE.md now imports AGENTS.md so Claude Code loads the same method and contributor rules as every other agent.
- The accuracy notes moved into AGENTS.md so every agent reads them.
- AGENTS.md names `node scripts/build.mjs --rehash` for canonical asset edits.

## [0.1.10] - 2026-09-26

### Added

- `node scripts/build.mjs --rehash <asset-path> [<asset-path> ...]` refreshes the manifest SHA-256 for only the named canonical assets and prints each old and new digest. It refuses the manifest itself, the archive and unknown paths, and writes nothing on refusal. Plain `node scripts/build.mjs` never changes manifest digests, so an unreviewed edit still fails the source-hash check.

### Changed

- CONTRIBUTING and RELEASING name the `--rehash` step for intentional canonical edits.

## [0.1.9] - 2026-09-26

### Fixed

- `llms.txt` labels: the manifest entry names what it indexes instead of the bare word "manifest", and a label no longer ends in a colon. A test fails if any catalog label ends in a colon or is a bare asset kind.

## [0.1.8] - 2026-09-26

### Added

- Web design review in the existing checks. BM05 now names common template tells (gradient heading text, side-stripe card borders, the generic purple-to-blue palette, nested cards, icon-tile stacks, bounce easing, decorative numbered labels, thin border with a wide soft shadow) and contextual landing-page layout defaults. A recorded brand decision overrides each default, and text expansion, zoom and reflow always win.
- CQ06 checks design-token drift and repeated copy-paste shortcuts, and asks that findings be verified in source before they are reported. B08 replays the chosen layout defaults on the built page at the recorded mobile and desktop viewports.
- Prompt 04 opens with a one-line design read (page type, audience, direction) and points to BM05.
- `docs/PROVENANCE.md` credits the techniques to Impeccable (Apache-2.0) and Taste Skill (MIT). No upstream text was copied and no dependency was added.

## [0.1.7] - 2026-09-25

### Changed

- Grok Bot has its own setup in the Grok adapter, written from xAI's Grok Bot documentation (read 2026-09-25) and the operator's own use: install the package into `/workspace`, save it as a private skill, and run TEAM as a six-Bot group with Reviewer outside Grok Bot, since every Bot runs on Grok. Grok Bot stays a documented setup with no trial receipt ([#15](https://github.com/aunysillyme/website-build-skill/issues/15)).
- The shared manual fallback no longer names an instruction field or a seven-Bot group; it points to where each host keeps standing instructions and respects the host's group limit.
- One description everywhere: `package.json`, the GitHub About box, npm and `.claude-plugin/plugin.json` now carry the same line, which matches the README lead and names the solo or team choice. The plugin manifest also gains the homepage and keywords.

## [0.1.6] - 2026-09-24

### Added

- Dated native-loading receipt for the Grok Build CLI 1.0.40 (SOLO, macOS, trusted folder, 2026-09-24) in `docs/evidence/`, linked from compatibility and the Grok adapter ([#15](https://github.com/aunysillyme/website-build-skill/issues/15)).

### Changed

- The Grok adapter says to trust the project folder: Grok Build offers project skills only in a trusted folder, found during the trial. Grok Bot (the Bots app) is named separately as still awaiting its trial.

## [0.1.5] - 2026-09-24

### Added

- Packed consumer-install checks for SOLO and TEAM on a Linux, macOS and Windows CI matrix, plus explicit live-host skips and a manual receipt gate ([#16](https://github.com/aunysillyme/website-build-skill/issues/16)).
- Dated native-loading receipts for Claude Code 2.1.281 and Codex CLI 0.154.0 (SOLO, macOS, 2026-09-24) in `docs/evidence/`, linked from compatibility and both adapter pages ([#15](https://github.com/aunysillyme/website-build-skill/issues/15)).

### Changed

- TEAM consistently describes installing seven workers' files, opening each session yourself and carrying handoffs, with Researcher first; presentation checks guard that wording ([#17](https://github.com/aunysillyme/website-build-skill/issues/17)).

### Fixed

- Receipts under a symlinked parent such as macOS `/tmp` are accepted; found during the 2026-09-24 host trials for [#15](https://github.com/aunysillyme/website-build-skill/issues/15).

## [0.1.4] - 2026-09-23

### Added

- Fourteenth research domain covering languages and coding practice, with dated primary-source research and a saved library checklist.
- Coding-research prompt that turns the selected stack and versions into project coding standards before implementation.
- Code-quality checklist wired into Builder and Reviewer gates, covering tests, linting, formatting, type-checking, dependencies and secure code.
- Regression coverage for fourteen-domain research and freshness tables, and coding-research manifest and build links.

## [0.1.3] - 2026-09-23

### Fixed

- #13: Synchronized the repository settings description with `package.json`, added a description drift check and documented the release update step.
- #14: Documented the installed skill folder as the Hermes alias path root in the adapter, installer contract and CLI help, with regression coverage for help text and alias placement.

## [0.1.2] - 2026-09-23

### Changed

- README "Two ways to work" is a two-row table in place of the raw installer prompt; the save-location choices are one sentence. SKILL.md keeps the card verbatim because the agent shows it to the user, and the drift check now requires it there only.

## [0.1.1] - 2026-09-23

### Added

- Documentation index, related tools table and agent quick-start links.
- Installer demo recording script with receipt read-back and scratch cleanup.
- Regression coverage for sibling privacy exceptions, role boundaries and demo failures.
- `README.md` Common questions section answering what the package installs, which AI tools it works with, what it researches, SOLO vs TEAM, and how to remove it.
- Headless TEAM install command alongside the existing SOLO example in the README Quick start and For agents sections.
- `llms.txt` link labels generated from each source file's own heading or opening line, so a reader sees what a file teaches instead of a one-word kind.

### Changed

- Reframed the package as a skill pack that teaches an AI current website-building expertise, with the twelve stages showing how it applies those skills.
- README leads with the research-first method, setup and stage outcomes.
- Host setup guides link to a shared compatibility and evidence reference.
- Tool fallback tables, role boundaries and stack guidance lead with the next action.
- Discovery index puts quick start, installer and compatibility ahead of source listings.
- Package description summarizes the research, brand, design and build workflow.
- Generated bundles carry the updated canonical instructions.
- Every adapter's "Check that it loaded" section and the README host table now open with one positive sentence: native loading on that host is awaiting a real-client trial, and the check that follows confirms it on yours. `docs/COMPATIBILITY.md` states the same fact once, plainly, alongside what evidence moves a host from documented to tested.
- Quick start reads "Run the npm installer in your project folder" instead of assuming a website project already exists.
- The paste starter and the SOLO/TEAM choice card use affirmative phrasing with the same meaning: reporting research as BLOCKED when search is unavailable, claiming Ship only after the full route is available, and moving to TEAM later keeping everything already done.

### Fixed

- Research gate reaches a mechanical checker from a copied install: PATH, then npx at the manifest version, then the recorded manual equivalent.
- Restored the font-licensing verification trap on the Designer role, the role/permission-boundary fact on `SKILL.md`, and the four Grok Bot manual-relay clarifiers, all of which the 0.1.1 positive-framing rewrite had deleted instead of reframing (ROUND 1 audit, HIGH/MEDIUM/LOW).
- `src/validate.mjs` sibling-repository privacy exemption now allows the same sentence-ending period as the self-repository exemption, without exempting a different repository name appended with a period (such as `.private`).

## [0.1.0] - 2026-09-23

### Added

- Per-claim page fetch receipts with verbatim excerpts and OPENED or UNVERIFIED ledger status.
- Deterministic `check-library` CLI checks and independent live source sampling in the research gate.
- Research-first website method, stage prompts, roles, playbooks and artifact templates.
- Manual adapters, generated upload bundles and manifest-derived discovery index.
- Community documents, repository settings checklist and local content gates.

### Changed

- Research acceptance stays BLOCKED for acted-on claims without consistent fetch receipts.
- Scope saves consistently use `<root>/site-work/research/library/scope.md`.
- Mockups require an image per direction and viewport, optionally with a static HTML preview.
- Same-day receipt reuse follows the UTC calendar day within one engagement, with new fetches after day changes or change triggers.

- First-run retrieval paths name the public repository tree, archive and raw files instead of waiting on publication.
- The install choice card distinguishes file installation from manual worker setup; the installer does not start workers.
- The zero-install starter names the full twelve-stage route, including Scope, Choose, Protect and Challenge.
- Maintainer scripts use plain JavaScript ES modules without the former TypeScript runtime flag.
- Repository settings are recorded as a dated live read-back rather than an unapplied proposal.

- The installer the contract specified: preflight, symlink and traversal refusal, no-clobber
  idempotence, dry run, a receipt of per-file digests, receipt-based uninstall and exit codes.
- Publishable package metadata with a real `bin`, an engine floor continuous integration runs,
  and a `v*` tag that publishes with provenance through npm trusted publishing.
- Sources renamed from `.ts` to `.mjs`, since none of them contained TypeScript. The
  `--experimental-strip-types` flag, its runtime guard and the Node 22.6 floor are gone.

### Planned

- Generated native workers for the seven-role team, gated on schema and permission tests.
- Clean-client trials, behavioral evaluations and fresh-tarball trials on Linux and Windows.

[Unreleased]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.19...HEAD
[0.1.19]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.18...v0.1.19
[0.1.18]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.17...v0.1.18
[0.1.17]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.16...v0.1.17
[0.1.16]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.15...v0.1.16
[0.1.15]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.14...v0.1.15
[0.1.14]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.13...v0.1.14
[0.1.13]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.12...v0.1.13
[0.1.12]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.11...v0.1.12
[0.1.11]: https://github.com/aunysillyme/website-build-skill/compare/v0.1.10...v0.1.11

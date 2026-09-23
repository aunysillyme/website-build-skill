# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version policy: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

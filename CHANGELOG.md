# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version policy: [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).
No version has shipped. Metadata version 0.1.0 identifies an unreleased draft.

## [Unreleased]

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

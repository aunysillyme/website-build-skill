# Release operations

## What and why

This is the end-to-end operating document for repository validation and future distribution.
The current system generates Markdown bundles and checks repository content locally.
Publication, installer compilation, native installs and release asset delivery are planned and unavailable.
The release workflow deliberately ends BLOCKED. It must never be described as a publisher.

## Trigger

Local: a maintainer changes canonical content or adapters and explicitly runs the commands below.
Hosted checks: pull request, push to main or manual dispatch after repository creation.
Release readiness: explicit dispatch with an existing version tag after review and authorization.
No tag push automatically publishes anything. No scheduled publication exists.

## Invocation chain

1. Read the candidate and resolve any source, privacy, claim-review or license defect.
2. Run `node --experimental-strip-types scripts/build.ts` to regenerate bundles and the index.
3. Run `node --experimental-strip-types scripts/check.ts` without rewriting outputs.
4. Run `node --experimental-strip-types --test test/*.test.ts` for rejection cases and valid controls.
5. Review the exact candidate with an independent model family before wiring executable changes into live automation.
6. For planned publication, bind an immutable version tag to that candidate and verify version agreement among package, plugin, manifest, changelog and tag.
7. For planned publication, build once from that tag; inspect the actual npm tarball and skill ZIP against explicit allowlists. Keep checksums and source identity.
8. For planned publication, obtain release authorization for those concrete artifacts; publish those bytes through a reviewed publisher with narrowly scoped credentials.
9. For planned publication, download afresh and complete the verification loop below before recording a release as complete.

## Dependencies

Local maintainer runtime: Node 22.22.3 with explicit TypeScript stripping. No dependency install is needed.
Other runtime versions, hosted execution and the proposed TypeScript compiler configuration remain UNVERIFIED.
Workflow files use the JSON subset of YAML so structural security checks need no YAML dependency.
The checkout and runtime setup actions are pinned to upstream commit URLs recorded in provenance.
Network is only needed by hosted checkout/runtime setup and future public delivery probes, not by the local content gates.
Future npm publication needs an authorized registry identity and a reviewed trusted-publishing configuration; none is wired here.

## Reads

Canonical manifest and assets, the Grok manual fallback, team ownership roster,
public documents, metadata, workflow files, coverage register and editorial claim ledger.
Generated bundles preserve source boundaries and rebase rendered links to canonical files.
The archive is an immutable input and never an active bundle member.

## Writes

Build writes exactly `docs/bundles/method.md`, `prompts.md`, `playbooks.md`, `checklists.md`,
`team.md` below that same bundle directory, plus root `llms.txt`.
Check writes nothing. Tests create synthetic scratch directories only under `.test-work/` and remove their own directories.
The installer sentinel writes no files and returns exit code 2.
Current workflows have only `contents: read`. They create no release, tag or registry version.
Future publication would need contents write only in its publishing job and identity-token write only for a reviewed trusted-publishing flow.

## The closed loop

Local success requires exit 0 from both the read-only check and the test runner, with no unexpected skips.
The privacy gate passes on the published tree. Its two public-identifier exemptions are narrow and
documented in `docs/EVALUATION.md`; the tests run against the same policy, not a separate one.
Inspect the full output and changed file list. A generated file existing is not enough; its bytes must match regeneration.
Hosted success requires the exact source revision's run to pass. Hosted execution is UNVERIFIED until that run exists.
The release readiness workflow must end BLOCKED until the publisher and its immutable-tag gate are implemented.
Future release completion requires fresh unauthenticated raw-file retrieval, manifest/hash read-back,
fresh tarball/ZIP downloads, fresh isolated installs, native invocation and first-stage research flow on each claimed host/version.
Record downloaded bytes, commands, versions, date, actual results and any gaps as sanitized evidence.
Update the changelog only for a real release. Metadata version 0.1.0 is presently an unreleased draft.
Watcher: local checks have no watcher. GitHub Actions can notify configured repository watchers; delivery is UNVERIFIED.
No separate watchdog is configured. The public repository owner is the failure recipient; use public issues only for sanitized operational failures and private reporting for security.

## Failure modes

- Missing input or invalid manifest: repair the canonical reference, never silently drop a stage.
- Bundle drift: review the source change and regenerate, then rerun check. Never have CI silently repair the candidate.
- Private data: remove it from all public artifacts; if already exposed, use private incident handling and rotate affected credentials through the owner's authorized process.
- Claim review pending: review the prose and actual evidence before updating its checksum entry; the generator must not approve claims.
- Floating action or write permission: restore an upstream full SHA and read-only permissions; review any scope expansion independently.
- Local tests fail: stop publication, reproduce, fix confirmed defects and rerun the affected harness.
- Runtime or network unavailable: report BLOCKED with the failing command; do not substitute a pass.
- Future publication partly succeeds: inspect registry and release state before any retry. Never assume an npm version can be overwritten or routinely deleted.
- Future bad release: halt promotion, publish a corrected version after review, and use the registry's then-current deprecation mechanism. Preserve hashes and disclose affected versions. Do not silently replace bytes under a release claim.
- Missing maintainer response: preserve the candidate and evidence, keep publication blocked and use the repository's documented escalation route.

## Run and verify by hand

From the repository root, with no project data in the tree:

```sh
node --version
node --experimental-strip-types scripts/build.ts
node --experimental-strip-types scripts/check.ts
node --experimental-strip-types --test test/*.test.ts
```

Expected now: build names six generated files; check prints PASS; tests exit 0 after rejecting
every RED fixture. Check must print PASS before publication can proceed.
Run check once more only if a file changes after verification.
To exercise the unavailable installer boundary, run `node bin/website-build-skill.mjs`.
Expected: exit 2, an UNAVAILABLE message and no file writes. That is a sentinel check, not an install test.
For hosted readiness after creation, open Actions, select Release readiness and provide the authorized existing tag.
Expected today: content gates run and the publication step ends BLOCKED. Do not bypass it.
No public release command is offered because the publisher is not built.

## Source of truth

Canonical method: `skills/website-build-skill/manifest.json` and its declared assets.
Distribution generator: `src/bundle.ts`; checks: `src/validate.ts`; invocation: `scripts/build.ts` and `scripts/check.ts`.
Workflow definitions: `.github/workflows/check.yml` and `.github/workflows/release.yml`.
Editorial review: `docs/evidence/content-review.json`; coverage: `docs/evidence/floor.json`.
Ownership: the public repository account at https://github.com/aunysillyme/website-build-skill.
This document owns the operating chain; no private plan or external machine path is needed to run it.

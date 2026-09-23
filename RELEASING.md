# Release operations

## What and why

This is the end-to-end operating document for repository validation and distribution.
The system generates Markdown bundles, checks repository content locally, and publishes the
package to npm when a version tag is pushed. Native worker generation and any claim of host
activation remain unavailable and unverified; publication of the files is not.
The release workflow IS the publisher. It holds no stored registry secret: it authenticates
through npm trusted publishing, which exchanges a short-lived OIDC token issued to that one job.

## Trigger

Local: a maintainer changes canonical content or adapters and explicitly runs the commands below.
Hosted checks: pull request, push to main or manual dispatch after repository creation.
Release: pushing a `v*` tag runs the publish job, which republishes nothing and refuses a tag
whose version disagrees with `package.json`. No scheduled publication exists, and no branch
push publishes. Creating the GitHub release page stays manual.

## Invocation chain

1. Read the candidate and resolve any source, privacy, claim-review or license defect.
2. Run `node scripts/build.mjs` to regenerate bundles and the index.
3. Run `node scripts/check.mjs` without rewriting outputs.
4. Run `node --test test/*.test.mjs` for rejection cases and valid controls.
5. Review the exact candidate with an independent model family before wiring executable changes into live automation.
6. Update `CHANGELOG.md`, then set the same version in `package.json`, `.claude-plugin/plugin.json` and the manifest's `packageVersion`; the check fails when they disagree.
7. Commit, then push an immutable `v<version>` tag on that commit. Leave the tag where it is: npm provenance names that exact commit, so a later history rewrite would point the provenance at a commit that no longer exists.
8. The workflow re-runs the gates, packs the tarball, installs it in a scratch project, runs the installed entry point, and only then publishes with `--provenance`.
9. Wait for the registry, which lagged by roughly a minute on the sibling repository, then complete the verification loop below before recording the release as complete.

## Dependencies

Local maintainer runtime: Node 22.22.3. The sources are plain ES modules; no build step or dependency install is needed.
The check matrix covers Node 18, 20, 22.22.3 and 24. Sources are JavaScript ES modules;
no TypeScript compiler is part of this operating chain. Consult the revision-bound
baseline receipt in docs/evidence/audit-baseline.json and rerun checks for a new candidate.
Workflow files use the JSON subset of YAML so structural security checks need no YAML dependency.
The checkout and runtime setup actions are pinned to upstream commit URLs recorded in provenance.
Network is needed by hosted setup, registry publication and public delivery probes,
not by the local content gates.
npm trusted publishing must be configured once, by hand, on npmjs.com: the package's settings,
Trusted publisher, GitHub Actions, with the owner and repository exactly as they appear in
https://github.com/aunysillyme/website-build-skill
then workflow `release.yml` and an empty environment. A package that does not exist yet
cannot carry that setting, so the FIRST version is published by hand from an authorized
maintainer login, and every version after it is published by the workflow. `npm publish --provenance` only works
inside a CI runner; never run that flag locally.

## Reads

Canonical manifest and assets, the Grok manual fallback, team ownership roster,
public documents, metadata, workflow files, coverage register and editorial claim ledger.
Generated bundles preserve source boundaries and rebase rendered links to canonical files.
The archive is an immutable input and never an active bundle member.

## Writes

Build writes exactly `docs/bundles/method.md`, `prompts.md`, `playbooks.md`, `checklists.md`,
`team.md` below that same bundle directory, plus root `llms.txt`.
Check writes nothing. Tests create synthetic scratch directories only under `.test-work/` and remove their own directories.
The installer writes only its destination, the output root probe it removes, and its receipt.
The check workflow has only `contents: read`. The release workflow's publish job adds exactly
one permission, `id-token: write`, for the OIDC exchange, and the workflow validator refuses
that permission at the top level, in any other job, and in any other workflow.
The installer writes only inside the destination it was given, the output root probe it removes,
and its receipt.

## The closed loop

Local success requires exit 0 from both the read-only check and the test runner, with no unexpected skips.
The privacy gate passes on the published tree. Its two public-identifier exemptions are narrow and
documented in `docs/EVALUATION.md`; the tests run against the same policy, not a separate one.
Inspect the full output and changed file list. A generated file existing is not enough; its bytes must match regeneration.
Hosted success requires the exact source revision's run to pass on every runtime in the matrix.
Release completion requires `npm view website-build-skill version` to name the tag, a fresh
`npx website-build-skill@<version> --version` from a machine that has never held the package,
and one real install into a scratch directory whose receipt digests match the bytes on disk.
Host discovery and activation are still not proven by any of that.
Record downloaded bytes, commands, versions, date, actual results and any gaps as sanitized evidence.
Update the changelog only for a real release.
Watcher: local checks have no watcher. GitHub Actions can notify configured repository watchers; delivery is UNVERIFIED.
No separate watchdog is configured. The public repository owner is the failure recipient; use public issues only for sanitized operational failures and private reporting for security.

## Failure modes

- Missing input or invalid manifest: repair the canonical reference, never silently drop a stage.
- Bundle drift: review the source change and regenerate, then rerun check. Never have CI silently repair the candidate.
- Private data: remove it from all public artifacts; if already exposed, use private incident handling and rotate affected credentials through the owner's authorized process.
- Claim review pending: review the prose and actual evidence before updating its checksum entry; the generator must not approve claims.
- Floating action or unexpected write permission: restore an upstream full SHA and read-only permissions, preserving only the reviewed publish-job OIDC exception.
- Local tests fail: stop publication, reproduce, fix confirmed defects and rerun the affected harness.
- Runtime or network unavailable: report BLOCKED with the failing command; do not substitute a pass.
- Future publication partly succeeds: inspect registry and release state before any retry. Never assume an npm version can be overwritten or routinely deleted.
- Future bad release: halt promotion, publish a corrected version after review, and use the registry's then-current deprecation mechanism. Preserve hashes and disclose affected versions. Do not silently replace bytes under a release claim.
- Missing maintainer response: preserve the candidate and evidence, keep publication blocked and use the repository's documented escalation route.

## Run and verify by hand

From the repository root, with no project data in the tree:

```sh
node --version
node scripts/build.mjs
node scripts/check.mjs
node --test test/*.test.mjs
```

Expected now: build names six generated files; check prints PASS; tests exit 0 after rejecting
every RED fixture. Check must print PASS before publication can proceed.
Run check once more only if a file changes after verification.
To exercise the installer end to end without publishing anything:

```sh
tarball="$(npm pack --silent)"
trial="$(mktemp -d)"
cd "$trial" && npm init -y > /dev/null && npm install "$OLDPWD/$tarball"
./node_modules/.bin/website-build-skill --solo --target codex --dir . --yes
```

Expected: exit 0, 55 files plus a receipt under `.agents/skills/website-build-skill/`, and
`--uninstall --receipt <that path>` leaving the directory empty again. Exit 5 instead of 0 means
the scratch project already had a router file; that is a completed install with an unmerged
snippet, not a failure.

## Source of truth

Canonical method: `skills/website-build-skill/manifest.json` and its declared assets.
Distribution generator: `src/bundle.mjs`; checks: `src/validate.mjs`; invocation: `scripts/build.mjs` and `scripts/check.mjs`.
Workflow definitions: `.github/workflows/check.yml` and `.github/workflows/release.yml`.
Editorial review: `docs/evidence/content-review.json`; coverage: `docs/evidence/floor.json`.
Ownership: the public repository account at https://github.com/aunysillyme/website-build-skill.
This document owns the operating chain; no private plan or external machine path is needed to run it.

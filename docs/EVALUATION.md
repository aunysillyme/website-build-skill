# Evaluation and evidence

Local deterministic checks and live agent behavior are different claims.
The checks below reject repository defects; they cannot prove a host obeys an instruction.
The [baseline receipt](evidence/audit-baseline.json) records a hosted CI run for one
exact revision. Platform activation, package publication and live model behavior
remain unproved by that run; check the current candidate separately.

## Run the repository gates

```sh
node scripts/check.mjs
node --test test/*.test.mjs
```

Check performs no writes. The test suite copies synthetic fixtures into `.test-work/`,
mutates one condition, asserts the named rejection and removes each scratch copy.
The GREEN control and the RED cases run against the same policy the CLI and CI use; there is
no separate test-only exemption. The public-identifier policy is resolved: the owning account
is permitted on the exact CODEOWNERS line and inside repository URLs, and the supported host's
product name is permitted as a product name. A path-shaped use of that product name is still
rejected, so a local working directory cannot pass through the exemption, and a test covers
that case. Private identifiers are also rejected in filenames, not only in file contents.

| RED case | Named rejection | Regression |
| --- | --- | --- |
| Private machine path | PRIVACY | RED01 in privacy.test.mjs |
| Private issue URL or identifier | PRIVACY | RED02 in privacy.test.mjs |
| Unavailable install advertised without a same-line label | INSTALL_CLAIM | RED03 in content.test.mjs |
| Missing Markdown relative target | LINK | RED04 plus image/reference/HTML/anchor controls |
| Generated bundle bytes drift | BUNDLE_DRIFT | RED05 in content.test.mjs |
| Floating action reference | ACTION_PIN | RED06 plus reusable-action control |
| Write token on a read-only job | WORKFLOW_PERMISSIONS | RED07 plus top-level/all-write controls |
| Inactive archive enters active prompts | ARCHIVE_EXCLUSION | RED08 plus manifest route checks |
| Unsupported test, measurement, publication or compatibility claim | CLAIM_EVIDENCE | RED09 in README, new docs and CHANGELOG |

## Editorial claim gate

Every public Markdown document outside canonical assets, generated bundles and inactive test fixtures
has a reviewed checksum in [content-review.json](evidence/content-review.json).
New or changed prose fails closed until a maintainer reviews it. This is intentionally broader than a keyword search.
The generator never updates that ledger. Canonical claims remain covered by manifest hashes and source review;
generated text must exactly match those sources. A checksum binds review scope, not factual truth.
The current disposition permits instructions and explicitly qualified status only.
A positive claim instead needs its exact text and a JSON evidence receipt under `docs/evidence/`
with command, environment, date, exitCode, artifactSha256 and observed result.
Reviewers must read that receipt and reproduce material results; a structurally valid receipt can still be false.
A change to the ledger itself requires code-owner review. No content checker can replace that authority.

## Privacy scope

The gate scans every public file, including hidden community metadata, fixtures and generated bundles.
It rejects personal paths, private identifiers, personal names and email addresses without echoing their values.
Production exceptions are exact license authorship and repository URL namespaces.
The related public repository allowlist contains exactly `agent-personalizer` and
`model-orchestrator`, for GitHub URLs, raw file URLs and npm GitHub shorthand.
The privacy regression rejects a third repository, longer names and adjacent private text.
The supported public product name and exact CODEOWNERS handle are narrow, resolved
exceptions implemented by privacyIssues. Path-shaped uses remain rejected. These
exceptions do not permit personal identifiers elsewhere.
The unchanged inactive archive is checksum-pinned; its historical path is never copied into active prompts.
Scratch fixture copies and version-control internals are outside the public-tree walker.
The final raw recursive sweep is a separate report step, so any literal policy conflict stays visible.

## Structural checks

Manifest assets must exist, match digests and contain all seven populated role bodies.
The README question must match the canonical template. Every generated bundle uses manifest order.
The workflow validator accepts the JSON subset of YAML, checks every action reference recursively,
requires read-only permissions except the release publish job's scoped OIDC token, disables persisted checkout credentials,
and requires concurrency cancellation and job timeouts. Other YAML syntax fails closed pending parser review.
External URL reachability is outside the offline link check.

## Planned live behavior evaluation

Run the [end-to-end host trial](evaluation/host-trial.md) to collect a complete
synthetic SOLO local-preview result and the negative cases below. Its receipt template
is deliberately NOT RUN. The method's outcome remains unproved until actual artifacts
and a reproducible trial are reviewed; adding the protocol does not establish support.

| Scenario | Required observation |
| --- | --- |
| Missing brand kit | Requests suitable screenshots and labels inferences |
| No search or stale library | Returns queries/unresolved claims; no downstream design |
| Missing source or date | Blocks research and dependent roles |
| SOLO transition | Reopens library, completes learning and saves self-handoff |
| TEAM transition | Seven actual routes; Researcher first; Coordinator reads saved evidence |
| Same-family Reviewer | INTERNAL critique, independent gate BLOCKED |
| No memory | Returns a save/reattach packet without claiming persistence |
| Conflicting accents | Surfaces conflict and requests only the decision that changes the design |
| Hostile fetched text | Refuses instruction injection and keeps authorized write scope |
| Reviewer allegation | Reproduces before recording a confirmed defect |
| Date ladder and reuse | Rejects every inactive ASK DATE fixture and passes genuine evidence controls |

These are evaluation specifications, not completed trials. Installer regressions run
as ordinary tests. Cross-platform fresh-package and live-date evaluations remain TODO.
Run live evaluations only with explicit tool access and an approved budget.

## File and evidence index

- [Historical local run](evidence/local-checks.json): an earlier TypeScript-era source snapshot; preserve it as historical evidence, not current-candidate validation.
- [Audit baseline](evidence/audit-baseline.json): exact baseline revision, local checks, hosted CI and registry observation. Rerun gates after changes.

- [Floor coverage register](evidence/floor.json): exhaustive section-4 filenames and implementation scope.
- [Content regressions](https://github.com/aunysillyme/website-build-skill/blob/main/test/content.test.mjs), [privacy regressions](https://github.com/aunysillyme/website-build-skill/blob/main/test/privacy.test.mjs).
- [Installer boundary](https://github.com/aunysillyme/website-build-skill/blob/main/test/installer.test.mjs), [package boundary](https://github.com/aunysillyme/website-build-skill/blob/main/test/package.test.mjs), [date routing](https://github.com/aunysillyme/website-build-skill/blob/main/test/research-date.test.mjs).
- [Synthetic missing asset](https://github.com/aunysillyme/website-build-skill/blob/main/test/fixtures/invalid-manifest.json), [brand conflict](https://github.com/aunysillyme/website-build-skill/blob/main/test/fixtures/conflicting-brand.json).
- [Malicious source](https://github.com/aunysillyme/website-build-skill/blob/main/test/fixtures/malicious-source.md), [incomplete handoff](https://github.com/aunysillyme/website-build-skill/blob/main/test/fixtures/incomplete-handoff.yaml), [date cases](https://github.com/aunysillyme/website-build-skill/blob/main/test/fixtures/ask-date-cases.md).
- [Bundle generator](../src/bundle.mjs), [validator](../src/validate.mjs), [build entry](https://github.com/aunysillyme/website-build-skill/blob/main/scripts/build.mjs), [check entry](https://github.com/aunysillyme/website-build-skill/blob/main/scripts/check.mjs).
- [CLI contract](../src/cli.mjs), [choice accessor](../src/choice.mjs), [destination catalog](../src/catalog.mjs), [install contract](../src/install.mjs), [agent contract](../src/agents.mjs).
- [Entry point](../bin/website-build-skill.mjs), [install engine](../src/install.mjs), [package metadata](../package.json), [lock metadata](https://github.com/aunysillyme/website-build-skill/blob/main/package-lock.json).
- [Check workflow](https://github.com/aunysillyme/website-build-skill/blob/main/.github/workflows/check.yml), [release boundary](https://github.com/aunysillyme/website-build-skill/blob/main/.github/workflows/release.yml).

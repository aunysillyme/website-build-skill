# Evaluation and evidence

Local deterministic checks and live agent behavior are different claims.
The checks below reject repository defects; they cannot prove a host obeys an instruction.
Hosted CI, platform support, package publication and live model behavior remain UNVERIFIED.

## Run the repository gates

```sh
node --experimental-strip-types scripts/check.ts
node --experimental-strip-types --test test/*.test.ts
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
| Private machine path | PRIVACY | RED01 in privacy.test.ts |
| Private issue URL or identifier | PRIVACY | RED02 in privacy.test.ts |
| Unavailable install advertised without a same-line label | INSTALL_CLAIM | RED03 in content.test.ts |
| Missing Markdown relative target | LINK | RED04 plus image/reference/HTML/anchor controls |
| Generated bundle bytes drift | BUNDLE_DRIFT | RED05 in content.test.ts |
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
The required public product wording and CODEOWNERS handle conflict with the literal ban.
Their exceptions remain pending clarification; CI does not silently allow them.
The unchanged inactive archive is checksum-pinned; its historical path is never copied into active prompts.
Scratch fixture copies and version-control internals are outside the public-tree walker.
The final raw recursive sweep is a separate report step, so any literal policy conflict stays visible.

## Structural checks

Manifest assets must exist, match digests and contain all seven populated role bodies.
The README question must match the canonical template. Every generated bundle uses manifest order.
The workflow validator accepts the JSON subset of YAML, checks every action reference recursively,
requires read-only permissions at workflow and job scope, disables persisted checkout credentials,
and requires concurrency cancellation and job timeouts. Other YAML syntax fails closed pending parser review.
External URL reachability is outside the offline link check.

## Planned live behavior evaluation

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

These are evaluation specifications, not completed trials. The test runner reports the unavailable installer,
fresh-package and live-date evaluations as TODO rather than pretending they passed.
Run live evaluations only with explicit tool access and an approved budget.

## File and evidence index

- [Recorded local run](evidence/local-checks.json): actual commands, exits and sanitized output; strict privacy blockage is retained.

- [Floor coverage register](evidence/floor.json): exhaustive section-4 filenames and implementation scope.
- [Content regressions](../test/content.test.ts), [privacy regressions](../test/privacy.test.ts).
- [Installer boundary](../test/installer.test.ts), [package boundary](../test/package.test.ts), [date routing](../test/research-date.test.ts).
- [Synthetic missing asset](../test/fixtures/invalid-manifest.json), [brand conflict](../test/fixtures/conflicting-brand.json).
- [Malicious source](../test/fixtures/malicious-source.md), [incomplete handoff](../test/fixtures/incomplete-handoff.yaml), [date cases](../test/fixtures/ask-date-cases.md).
- [Bundle generator](../src/bundle.ts), [validator](../src/validate.ts), [build entry](../scripts/build.ts), [check entry](../scripts/check.ts).
- [CLI contract](../src/cli.ts), [choice accessor](../src/choice.ts), [destination catalog](../src/catalog.ts), [install contract](../src/install.ts), [agent contract](../src/agents.ts).
- [Unavailable executable sentinel](../bin/website-build-skill.mjs), [private metadata](../package.json), [lock metadata](../package-lock.json), [compiler configuration](../tsconfig.json).
- [Check workflow](../.github/workflows/check.yml), [release boundary](../.github/workflows/release.yml).

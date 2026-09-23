# Library receipt checker

## What and why

`check-library` checks that a research ledger's opened claims have consistent local
fetch receipts. It cannot prove a fetch happened, that an excerpt is verbatim, or
that the excerpt supports the claim. Independent live-page review remains required.

## Trigger

Run before research acceptance and again when claims or receipts change. AD03,
AD04 and AD07 consume the result; AD09 adds independent source re-fetching.

## Invocation chain

Run `website-build-skill check-library <site-work-dir>`. In a repository checkout,
run `node bin/website-build-skill.mjs check-library <site-work-dir>`.
The binary calls `src/cli.mjs`, which calls `checkLibrary` in `src/library-check.mjs`.
The binary prints the result and sets its process exit code. Exit 0 means local
receipt consistency; exit 2 means invalid input or a failed check, printed to stderr.

## Dependencies

Node and the package's own modules. No external packages, network access, fetch tool
credentials, installation writes or background services are needed by the checker.

## Reads

Relative to the supplied site-work directory, read `research/library/sources.md`
and `research/library/receipts/<CLAIM-ID>.md` for each ledger claim. Refuse symlink
paths and unsafe claim IDs. Claim IDs begin with `CLAIM-` and continue with letters,
digits, hyphens or underscores. Every table row has these columns:

```text
| Claim ID | Domain | Statement | URL | Published | Accessed | Status | Dependents |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Use plain cells, escape a literal pipe as `\|`, and write `unknown` for an absent
publication date. Column names ignore case, spaces, hyphens and underscores.
The status vocabulary is `OPENED` or `UNVERIFIED`; legacy `Verified` labels in any
case receive the same receipt checks as `OPENED`, never an exemption.

Each receipt contains plain `url:`, `fetched_at:`, `tool:`, `result:`, `published:`
and `excerpt:` fields. Use an environment-supplied UTC timestamp ending in `Z`,
with seconds and optional three-digit milliseconds. Copy the publication date
verbatim into both ledger and receipt, or use `unknown`. The date must appear in
the excerpt. Put the verbatim supporting passage after `excerpt: |`, with every
line indented two spaces; a single-line `excerpt:` is also accepted. The trimmed
passage must contain at least 80 characters. Preserve fetch evidence at fetch time.

## Writes

None. The caller captures the command, exit code and complete output in the gate
record. The checker lists UNVERIFIED claims even on a successful consistency check.

## The closed loop

Nothing watches a project library automatically. Researcher runs the check and
corrects findings; Coordinator reopens the artifacts and records acceptance.
An acted-on UNVERIFIED claim keeps acceptance BLOCKED even when the checker exits 0.
Reviewer independently re-fetches the AD09 sample and reports excerpt mismatches.
Send checker defects to the package maintainer with a synthetic reproducer; send
source discrepancies to Researcher by claim ID and pause dependent decisions.

## Failure modes

Missing or malformed ledgers, unsafe paths, duplicate claim IDs, absent or incomplete
receipts, short excerpts, URL differences, inconsistent publication dates and
blanket verification over unreceipted rows produce failures. A consistent fabricated
receipt can still pass: this is a local consistency check, not fetch authentication.
Timestamp provenance, live support for the claim and freshness require gate review.

## Run and verify by hand

From the repository root:

```sh
node bin/website-build-skill.mjs check-library test/fixtures/library-red
node bin/website-build-skill.mjs check-library test/fixtures/library-green
node --test test/library-check.test.mjs
```

Expect the RED fixture to exit 2 and name both unreceipted claims plus its blanket
verification claim. Expect GREEN to exit 0 with counts. The fixtures are synthetic
or inactive regression data, never live research evidence.

## Source of truth

The implementation is `src/library-check.mjs`. The research policy lives in
`skills/website-build-skill/checklists/research.md`; receipt authoring is specified
in `skills/website-build-skill/templates/evidence.md` and
`skills/website-build-skill/playbooks/research-and-memory.md`.
Tests live in `test/library-check.test.mjs`. Hosted and live-client behavior remains
UNVERIFIED until an actual trial is separately authorized and recorded.

# Contributing

Welcome: reproducible defects, clearer instructions, accessible examples and host evidence.
Start with a small issue describing the user-visible failure and a concrete success check.
Use synthetic fixtures and reserved example domains. Never paste real project transcripts.

## Edit the source

- Canonical method: `skills/website-build-skill/`; read its manifest before changing a route.
- Generated files: `docs/bundles/*.md` and `llms.txt`; never hand-edit them.
- Team supplement: `adapters/grok.md` supplies the manual fallback appended by the generator.
- Archive: preserve the inactive graphics original byte-for-byte. Keep it out of active routes and bundles.
- Digests: after an intentional canonical edit, run `node scripts/build.mjs --rehash <asset-path> [<asset-path> ...]` for only the edited assets, using paths from manifest `assets[].path` relative to `skills/website-build-skill/`. Review the manifest diff and regenerated bundles. The manifest itself and archive cannot be rehashed.
- Claims: changed storefront/reference prose requires an explicit review entry in `docs/evidence/content-review.json`. Do not regenerate that ledger as part of the build.
- Evidence: any affirmative test, measurement, publication or compatibility claim needs a repository evidence file with command, environment, date, result and artifact identity. A URL or an invented receipt is insufficient.

## Voice

- Lead with the useful action, use short sentences and name the artifact.
- No em dashes. No fabricated measurements, clients, testimonials or support guarantees.
- Mark unavailable commands planned on the same line; mark uncertain behavior UNVERIFIED.
- Keep historical dates inside clearly inactive evidence; current research is relative to ASK DATE.

## Run locally

Prerequisite: Node 18 or newer; no dependency install is required. The check matrix
covers Node 18, 20, 22.22.3 and 24 on Ubuntu, plus packed installs on macOS and Windows
with Node 22.22.3. The file installer is implemented; live host
session loading remains UNVERIFIED. TEAM installs files; you open each session yourself
and carry the handoffs, with Researcher first. Registry publication is a separate
release step, not something inferred from a working local executable.

```sh
node scripts/build.mjs
node scripts/check.mjs
node --test test/*.test.mjs
```

Plain build rewrites only the five bundles and the index; `--rehash` also refreshes only the named asset digests. Check is read-only and fails on drift.
Tests use synthetic temporary directories inside this checkout or the OS temporary
directory and remove them afterward. Live host behaviour is verified by receipts, not
by `npm test`; follow the [manual host gate](docs/evaluation/host-gate.md) for each skip.
For a new check, demonstrate a failing fixture and a valid control. See [evaluation](docs/EVALUATION.md).
The Markdown gate checks file targets, reference links, images, HTML links and heading anchors.
External URLs require a separate live review; offline success does not prove availability.

## Contributor License Agreement

Outside contributors tick the Contributor License Agreement box in the PR description.
You keep the copyright in what you wrote and grant Auny LLC the licenses in [CLA.md](CLA.md).
The `cla` check passes once the box is ticked.

## Review and handoff

Describe the problem, resulting behavior, exact checks and any remaining limits in the PR.
Obtain a different-family adversarial review before connecting new executable code to publication.
Do not publish, change settings, add secrets or expand write scope as part of a content contribution.
Use [private disclosure](SECURITY.md) for vulnerabilities and [conduct reporting](CODE_OF_CONDUCT.md) for abuse.
See [release operations](RELEASING.md) and [ownership](MAINTAINERS.md).

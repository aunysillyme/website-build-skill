# Manual host gate

Status: NOT RUN. This document defines the work behind the explicit live-host skips.
Live host behaviour is verified by receipts, not by `npm test`. The suite reports these
items as skipped until a contributor supplies the required observations.

## Automated distribution boundary

Run from the package checkout:

```sh
node --test test/packed-artifact.test.mjs
npm run check
npm test
```

The packed-artifact test packs this revision, installs the tarball into a temporary
consumer's `node_modules`, resolves the installed bin there, and runs SOLO and TEAM
against empty destinations. It checks file trees, bytes, receipts and uninstall.
The repository check workflow schedules it on `ubuntu-latest`, `macos-latest` and
`windows-latest`. A configured matrix is a check to run; its results require CI evidence.
The stable Repository checks job requires every matrix entry to succeed.

Host discovery, upload controls, model behaviour and session permissions need the manual
checks below. The repository currently builds bundles and an npm tarball; it has no ZIP
production step. GitHub source archives and manually prepared skill ZIPs use the ZIP gate.

## Hosts and operating systems

Run each applicable item on the exact host, client version and OS whose compatibility
claim you intend to make. Use Linux, macOS and Windows for any claim covering all three;
keep unavailable host/OS combinations UNVERIFIED with a reason. A browser trial also
records browser version and account controls available during that trial.

| Host | Setup and loading instructions | Modes to observe |
| --- | --- | --- |
| Claude Code | [Adapter](../../adapters/claude-code.md) | SOLO and separately TEAM |
| Codex | [Adapter](../../adapters/codex.md) | SOLO and separately TEAM |
| Hermes | [Adapter](../../adapters/hermes.md), including explicit alias and trust checks | SOLO and separately TEAM |
| Antigravity | [Adapter](../../adapters/antigravity.md) | SOLO and separately TEAM |
| Grok Bot | [Adapter](../../adapters/grok.md), including attachment and manual relay controls | SOLO and separately TEAM |
| Claude Desktop | [Adapter](../../adapters/claude-desktop.md), including skill ZIP upload where exposed | SOLO; record any separate-session TEAM trial separately |
| ChatGPT Project | [Adapter](../../adapters/chatgpt-project.md) | SOLO; record any separate-session TEAM trial separately |
| Custom GPT | [Adapter](../../adapters/custom-gpt.md) | SOLO; record any separate-session TEAM trial separately |
| Generic file-reading agent | [Adapter](../../adapters/agents-md.md); name the actual client | SOLO; record any separate-session TEAM trial separately |

TEAM installs seven workers' files in one command; you open each session yourself and
carry the handoffs between them. Researcher goes first. Retain all seven setup
acknowledgements separately from the research receipt and later work receipts.

## Skipped item: live AD01-AD09 behaviour

Test title: `Live AD01-AD09 behavior: ladder evidence, clock override, no-search blockage, stale claims, derived floors and multi-day expiry`.

1. Use a fresh synthetic project on each claimed host/OS above. Follow the
   [host trial](host-trial.md) to install, explicitly load the skill and record tool access.
2. Run every case in `test/fixtures/ask-date-cases.md` from the matching source checkout
   (test fixtures are checkout-only files).
   Follow [AD01-AD09](../../skills/website-build-skill/checklists/research.md) and the
   [ASK DATE rule](../../skills/website-build-skill/playbooks/research-and-memory.md#ask-date-rule)
   for the expected boundary, including the independent AD09 review.
3. Record the supplied input, actual tool evidence and observed response for each case.
   Retain date ladder failures, conflicting clock evidence, absent search, stale claims,
   derived floors and multi-day expiry observations. A fixture's expected answer is a
   criterion, not an observation. Identify simulated tools separately from live tools;
   a simulation cannot establish the live capability it replaces.
4. Save scope, library, source receipts, gate output and transcript excerpts. Mark each
   AD check PASS, FAIL, BLOCKED or NOT APPLICABLE with its evidence and reason. A missing
   different-family Reviewer leaves AD09 BLOCKED.

## Skipped item: per-host npm and ZIP distribution

Test title: `Planned distribution: fresh npm tarball and ZIP installation on each claimed operating system and host`.
The npm file-install portion is automated above; this skip covers actual host loading
from that installation and ZIP extraction/upload on the host/OS combinations claimed.

1. From the revision being evaluated, run `npm pack --json --ignore-scripts --pack-destination <existing-temp-directory>`.
   Save the JSON report and the tarball digest. In a separate empty consumer, run
   `npm init -y`, then `npm install --ignore-scripts --no-audit --no-fund <absolute-tarball-path>`.
2. Run the consumer's installed bin, substituting the adapter target and a fresh absolute
   trial directory. Repeat with `--team` in another empty trial directory:

   ```sh
   node node_modules/website-build-skill/bin/website-build-skill.mjs --solo --target codex --dir <trial-directory> --yes
   ```

   Compare receipt paths and hashes with the disk. Open the actual host in the trial
   directory and follow its loading check. Record explicit file reads separately from
   native discovery. Verify accessible assets, preserved existing instructions and
   error/conflict behaviour in separate synthetic fixtures.
3. For a GitHub source ZIP, download the archive for that exact commit, record its URL
   and digest, extract it into an empty directory and follow the adapter's manual copy
   or bundle-attachment steps. Verify manifest hashes and loaded resources.
4. For a skill-upload ZIP, create an archive containing one complete
   `website-build-skill/` directory from `skills/website-build-skill/`, with manifest and
   relative assets. Record the packaging command/tool version, layout and digest.
   Upload using the actual account controls described by the adapter and confirm each
   loaded resource. Record absent upload controls as BLOCKED for that route. Source
   archives and skill-upload ZIPs are distinct artifacts and need separate results.
5. Save installer output, receipt, installed file/digest inventory, exact invocation,
   host transcript and observed limits. Use the [full trial](host-trial.md) separately
   before making a website-outcome claim.

## Receipt and acceptance

Copy [receipt-template.json](receipt-template.json) into the private trial workspace.
Fill its fields from observations, including:

- Identity: trial ID, package commit, artifact filename and SHA-256, host/client version,
  OS/version, runtime and actual model family, mode, invocation and start/end times.
- Commands: exact commands, working-directory roles, exit codes and relevant output.
- Boundaries: each skipped item and AD check attempted, expected and observed behaviour,
  status, and links to transcript excerpts, installed receipts and supporting files.
- Negative trials: missing tools, conflicts and other failures actually exercised.
- Review: candidate digest, actual reviewer family, findings and reproduced dispositions.
- Limits: untested host/OS/mode combinations and unavailable controls; reproduction steps.

Add artifact metadata to `artifacts` and per-case observations to `boundaries`; preserve
unknown values as null. Sanitize private paths, account identifiers and credentials.
Save the receipt as `docs/evidence/host-gate-<trial-id>.json` and its supporting artifacts
under `docs/evidence/host-gate-<trial-id>/`. A reviewer reopens those artifacts before
accepting the result. Keep failed and blocked receipts alongside successful ones.

Each skipped item advances to either a real executable test for the behaviour it can
assert, or a linked, reviewed receipt for the exact host/OS/mode observed. A receipt may
be linked beside a retained skip for combinations still awaiting trials. A skipped test
is never converted to a pass by editing its label, removing `skip`, or adding an empty
passing body. `npm test` alone establishes no live-host result. Promote compatibility
only for the observed scope under the [host-trial evidence rules](host-trial.md#publish-evidence-and-promote-narrowly).

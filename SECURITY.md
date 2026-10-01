# Security

This repository ships instructions. An agent and its host execute them with that host's permissions.
The realistic risks are instruction injection from fetched sources and an agent writing outside its scope.
Role prose, tool lists and a read-only role name are not a sandbox.

## Threat model

- Untrusted input: fetched pages, repositories, attachments, package metadata and handoffs.
- Protected assets: the user's files, credentials, deployment accounts and approved project boundaries.
- Injection: source text is evidence, never authority to change the user's instructions or export data.
- Writes: choose an explicit workspace, use one writer per artifact and preserve unrelated files.
- Review: use a fixed candidate and a different model family; return findings without granting write access.
- Installer: `npx website-build-skill` writes only inside the folders you name (`--dir` and `--output-dir`). Preflight refuses path traversal, symlinks planted below the install root and any conflict with an existing file before the first write. It never overwrites a changed file. It reads every file back from disk, writes a receipt of the digests it found, and `--uninstall` removes only files whose bytes still match that receipt. Tests: `test/installer.test.mjs` (traversal, symlink, conflict, receipt and uninstall cases) and `test/packed-artifact.test.mjs`. Contract: [installer guide](docs/INSTALLER.md).
- Release line: the latest published version receives fixes; earlier versions do not. npm releases are published by the release workflow with provenance, so a published version names the commit it was built from.

## Private disclosure

Use [Report a vulnerability](https://github.com/aunysillyme/website-build-skill/security/advisories/new).
Include a minimal synthetic reproduction, affected revision, expected scope and observed impact.
Never attach credentials, personal files or exploit output containing someone else's data.
If that route is unavailable, use GitHub's private Report abuse controls or [GitHub Support](https://support.github.com/contact).
Do not put private details in public issues while waiting for a secure route.

You will get an acknowledgement within 7 days and a fix or a reasoned "won't fix" within 30.
Maintainers triage privately, reproduce the defect, prepare a correction and coordinate disclosure.
Credit is given in the changelog unless you ask otherwise.
A missing capability is documented as BLOCKED or UNVERIFIED, never a completed security check.

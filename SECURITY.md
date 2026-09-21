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
- Installer: planned and unavailable. Destination traversal, symlinks, overwrite conflicts and interrupted writes require tests before any installer release.
- Release line: no released version and no support window yet. Use the unreleased tree for review only.

## Private disclosure

Use [Report a vulnerability](https://github.com/aunysillyme/website-build-skill/security/advisories/new).
Availability is UNVERIFIED until repository creation and private vulnerability reporting are enabled.
Include a minimal synthetic reproduction, affected revision, expected scope and observed impact.
Never attach credentials, personal files or exploit output containing someone else's data.
If that route is unavailable, use GitHub's private Report abuse controls or [GitHub Support](https://support.github.com/contact).
Do not put private details in public issues while waiting for a secure route.

Maintainers triage privately, reproduce the defect, prepare a correction and coordinate disclosure.
Response times are best effort; no service-level promise is made.
A missing capability is documented as BLOCKED or UNVERIFIED, never a completed security check.

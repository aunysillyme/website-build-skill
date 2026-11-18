# Hermes

TEAM: one command installs the seven workers' files; you open each session yourself (or configure delegated profiles) and carry the handoffs between them. Researcher goes first.

Check project trust and the installed client's loading controls before starting.
- Project install: `npx website-build-skill --team --target hermes --dir . --scope project --yes --bundle-dir team-aliases` (or `--solo`) installs into `.agents/skills/website-build-skill/`. The `--bundle-dir` path is relative to the installed skill folder, so the alias files land in `.agents/skills/website-build-skill/team-aliases/` and must stay inside that folder.
- User install (`--scope user`): `npx website-build-skill --team --target hermes --scope user --yes --bundle-dir team-aliases` (or `--solo`) installs into `~/.hermes/skills/website-build-skill/`.
- Plugin route: `hermes plugins install aunysillyme/website-build-skill` installs via the repository's `.claude-plugin/plugin.json` metadata.
- Manual SOLO: copy the complete canonical folder into a new `.agents/skills/website-build-skill/` in the chosen project (or `~/.hermes/skills/website-build-skill/` for user scope).
- For explicit loading, ask the session to read its `SKILL.md` directly.
- After confirming the installed CLI supports it, try preload: `hermes -s website-build-skill` after discovery is confirmed.
- After checking the installed CLI help, use its trust operation: `hermes skills trust`; this changes trust state and requires the user's authorization.
- Do not create version-control state or alter global settings during a copy.

## Open the workers

The installer does not generate separate static agent files for Hermes (`--team` copies the five bundles and optional `--bundle-dir` aliases). Two execution paths are available:
- **Hermes subagent delegation:** Hermes supports `delegate_task` (including `profile_routes` to map per-subagent profiles, models and skills). Configure and verify your `profile_routes`, tool limits and model families in Hermes, and enforce Researcher-first ordering and read-only Reviewer permissions.
- **Manual sessions:** open seven separate sessions yourself, Researcher first, supplying each complete role body from `roles/`, the linked resources and its current handoff. The `team-aliases` directory holds copies of the five bundles. Use [the team relay](grok.md#manual-fallback) and check each worker can read the assigned revision, including any uncommitted files it needs. Check Reviewer permissions on inherited tools; use a read-only packet and returned findings when needed.

## Shared core and receipt

Codex and Hermes `--scope project` paths overlap at `.agents/skills/website-build-skill/`. Compare content before writing and preserve conflicts (`--scope user` uses distinct paths: `~/.agents/skills/website-build-skill/` for Codex vs `~/.hermes/skills/website-build-skill/` for Hermes).
Test installation in both orders, partial receipts and reference ownership before supporting shared uninstall.
An explicit bundle directory authorizes only that destination. Never write a home-directory alias implicitly.
The receipt enumerates core files, bundles, alias copies, hashes, mode and pending integration.

## Settling checks

Verify project trust before/after explicit authorization, native preload, all manifest assets and each session or `delegate_task` route.
Verify seven acknowledgements, source-preserving relay, no downstream work before research and denied Reviewer writes.
Probe image, browser, execution and independent-family access separately.
Source targets: [skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills), [delegation](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation), [CLI](https://hermes-agent.nousresearch.com/docs/user-guide/cli).


## Check that it loaded

Native loading on this host is awaiting a real-client trial; the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and actual model families; if a second model family is unavailable, record `independent-review: INTERNAL (UNVERIFIED)` rather than claiming independent review.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When web search is absent, return `query-plan.md` and `unresolved-claims.md` with `UNVERIFIED` flagging; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

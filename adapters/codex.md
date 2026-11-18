# Codex

TEAM: one command installs the seven workers' files and subagent definitions; you open sessions or delegate from your main session and carry handoffs between them. Researcher goes first.

- Project install: `npx website-build-skill --team --target codex --dir . --scope project --yes` (or `--solo`) writes `.agents/skills/website-build-skill/` and, in `--team` mode, generates seven subagent files under `.codex/agents/website-<role>.toml`.
- User install: `npx website-build-skill --team --target codex --scope user --yes` writes `~/.agents/skills/website-build-skill/` and, in `--team` mode, generates `~/.codex/agents/website-<role>.toml`.
- Manual SOLO: copy the full canonical folder to a new `.agents/skills/website-build-skill/` in the chosen project.
- Load the skill: ask the host to load `website-build-skill`; confirm the exact file it opens.
- Subagent sandbox behavior: Codex subagents inherit the parent turn's sandbox and approval settings (`sandbox_mode` inside `.codex/agents/*.toml` is ignored by Codex and omitted from generated files). Enforce read-only review through parent turn controls or a read-only artifact packet rather than assuming `website-reviewer.toml` creates a separate read-only sandbox.
- TEAM receipts & manual relay: TEAM execution and loading receipts for generated `.codex/agents/` remain UNVERIFIED until recorded trials; separate manual sessions use [the full team bundle](../docs/bundles/team.md) and [manual relay](grok.md#manual-fallback). Do not overwrite `.codex/config.toml` or infer independence from two model names.
- Shared core: Hermes project installs (`--scope project`) use the same `.agents/skills/website-build-skill/` path; preserve identical content and retain the core until every owner releases it.
- Sources to verify: [skills](https://learn.chatgpt.com/docs/build-skills), [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).


## Check that it loaded

Native loading was tested on Codex CLI 0.154.0 (macOS, SOLO, 2026-09-24; one run in a read-only sandbox exercising loading only, limitations in the [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-codex-2026-09-24.json)); the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and actual model families; if a second model family is unavailable, record `independent-review: INTERNAL (UNVERIFIED)` rather than claiming independent review.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When web search is absent, return `query-plan.md` and `unresolved-claims.md` with `UNVERIFIED` flagging; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

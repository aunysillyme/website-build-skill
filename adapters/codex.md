# Codex

TEAM: one command installs the seven workers' files; you open each session yourself and carry the handoffs between them. Researcher goes first.

- Manual SOLO: copy the full canonical folder to a new `.agents/skills/website-build-skill/` in the chosen project.
- Load the skill: ask the host to load `website-build-skill`; confirm the exact file it opens.
- Install the files: `npx website-build-skill --team --target codex --dir . --scope project --yes`.
- TEAM sessions use [the full team bundle](../docs/bundles/team.md). Do not overwrite `.codex/config.toml` or infer independence from two model names.
- Shared core: Hermes may use the same candidate path; preserve identical content and retain the core until every owner releases it.
- Sources to verify: [skills](https://learn.chatgpt.com/docs/build-skills), [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).


## Check that it loaded

Native loading was tested on Codex CLI 0.154.0 (macOS, SOLO, 2026-09-24; one run, limitations in the [receipt](../docs/evidence/host-trial-codex-2026-09-24.json)); the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and families; an inherited family leaves independent review BLOCKED.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When a tool is absent, keep current research BLOCKED until opened sources return; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

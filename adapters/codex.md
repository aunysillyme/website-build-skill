# Codex

- Manual SOLO: copy the full canonical folder to a new `.agents/skills/website-build-skill/` in the chosen project.
- Candidate invocation, UNVERIFIED: ask the host to load `website-build-skill`; confirm the exact file it opens.
- Planned, unavailable: `npx website-build-skill --team --target codex --dir . --scope project --yes`.
- Planned native definitions: `.codex/agents/website-<role>.toml` with name, description and full canonical developer_instructions. Round-trip quotes and backslashes.
- Fallback: separate sessions using [the full team bundle](../docs/bundles/team.md). Do not overwrite `.codex/config.toml` or infer independence from two model names.
- Shared core: Hermes may use the same candidate path; preserve identical content and retain the core until every owner releases it.
- Sources to verify: [skills](https://learn.chatgpt.com/docs/build-skills), [custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).


## Common limits and smoke check

Status: UNVERIFIED. Instructions and candidate paths do not establish native support.
Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and families; an inherited family leaves independent review BLOCKED.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
No search blocks current research; no files requires saved-and-reattached bodies; no images blocks visual mockups.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

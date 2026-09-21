# Claude Code

- Manual SOLO: copy the intact canonical folder into a new project `.claude/skills/website-build-skill/` directory. Preserve conflicts.
- Candidate invocation, UNVERIFIED: `/website-build-skill` after native discovery; explicit fallback is to read its SKILL.md.
- Plugin: the repository root contains metadata and discovers the canonical `skills/` tree. There are no hooks or required service connections.
- Plugin installation is planned until the public repository exists and a clean client validates it.
- Planned, unavailable: `claude plugin marketplace add https://github.com/aunysillyme/website-build-skill`.
- Planned, unavailable: `claude plugin install website-build-skill@website-build-skill`.
- Candidate plugin invocation, UNVERIFIED: `/website-build-skill:website-build-skill`.
- Planned, unavailable: `npx website-build-skill --team --target claude-code --dir . --scope project --yes`.
- TEAM fallback: create separate sessions with complete [role bodies](../docs/bundles/team.md), Researcher first. Use the [manual relay](grok.md#manual-fallback).
- Planned native definitions: `.claude/agents/website-<role>.md`, YAML name and description plus the complete canonical body, with references resolved to the installed core.
- Source targets: [skills](https://code.claude.com/docs/en/skills) and [subagents](https://code.claude.com/docs/en/sub-agents). No live package trial is implied.


## Common limits and smoke check

Status: UNVERIFIED. Instructions and candidate paths do not establish native support.
Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and families; an inherited family leaves independent review BLOCKED.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
No search blocks current research; no files requires saved-and-reattached bodies; no images blocks visual mockups.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

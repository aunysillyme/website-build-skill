# Claude Code

- Manual SOLO: copy the intact canonical folder into a new project `.claude/skills/website-build-skill/` directory. Preserve conflicts.
- After checking native discovery, try `/website-build-skill`; for explicit loading, ask it to read its SKILL.md.
- Plugin: the repository root contains metadata and discovers the canonical `skills/` tree. The plugin loads the method files.
- For the plugin route, run the setup commands below and perform the loading check.
- Plugin setup: `claude plugin marketplace add https://github.com/aunysillyme/website-build-skill`.
- Plugin setup: `claude plugin install website-build-skill@website-build-skill`.
- Check the plugin invocation: `/website-build-skill:website-build-skill`.
- Install the files: `npx website-build-skill --team --target claude-code --dir . --scope project --yes`.
- TEAM fallback: create separate sessions with complete [role bodies](../docs/bundles/team.md), Researcher first. Use the [manual relay](grok.md#manual-fallback).
- Planned native definitions: `.claude/agents/website-<role>.md`, YAML name and description plus the complete canonical body, with references resolved to the installed core.
- Source targets: [skills](https://code.claude.com/docs/en/skills) and [subagents](https://code.claude.com/docs/en/sub-agents).


## Check that it loaded

Native loading on this host is awaiting a real-client trial; the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and families; an inherited family leaves independent review BLOCKED.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When a tool is absent, keep current research BLOCKED until opened sources return; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

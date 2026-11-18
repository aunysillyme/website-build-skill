# Claude Code

TEAM: one command installs the seven workers' files and native subagent definitions; you open sessions or delegate from your main session and carry handoffs between them. Researcher goes first.

- Project install: `npx website-build-skill --team --target claude-code --dir . --scope project --yes` (or `--solo`) writes `.claude/skills/website-build-skill/` and, in `--team` mode, generates seven subagent files under `.claude/agents/website-<role>.md`.
- User install: `npx website-build-skill --team --target claude-code --scope user --yes` writes `~/.claude/skills/website-build-skill/` and, in `--team` mode, generates `~/.claude/agents/website-<role>.md`.
- Manual SOLO: copy the intact canonical folder into a new project `.claude/skills/website-build-skill/` directory. Preserve conflicts.
- After checking native discovery, try `/website-build-skill`; for explicit loading, ask it to read its `SKILL.md`.
- Plugin: the repository root contains `.claude-plugin/` metadata and discovers the canonical `skills/` tree. The plugin loads the method files.
- Plugin setup: `claude plugin marketplace add https://github.com/aunysillyme/website-build-skill`.
- Plugin setup: `claude plugin install website-build-skill@website-build-skill`.
- Check the plugin invocation: `/website-build-skill:website-build-skill`.
- Generated subagents (`--team`): `website-reviewer.md` sets `disallowedTools: Write, Edit, Bash` so it retains read, search, `WebFetch`/`WebSearch`, and MCP tools for AD09 live source re-checks without writing files. The other six roles omit `tools:` so they inherit parent session tools while following role file ownership.
- TEAM receipts & manual relay: installing `.claude/agents/` files does not launch running sessions or supply a second model family; host loading and execution receipts for TEAM remain UNVERIFIED until recorded trials. You can also open separate sessions with complete [role bodies](../docs/bundles/team.md), Researcher first, using the [manual relay](grok.md#manual-fallback).
- Source targets: [skills](https://code.claude.com/docs/en/skills) and [subagents](https://code.claude.com/docs/en/sub-agents).


## Check that it loaded

Native loading was tested on Claude Code 2.1.281 (macOS, SOLO, 2026-09-24; one run, limitations in the [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-claude-code-2026-09-24.json)); the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and actual model families; if a second model family is unavailable, record `independent-review: INTERNAL (UNVERIFIED)` rather than claiming independent review.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When web search is absent, return `query-plan.md` and `unresolved-claims.md` with `UNVERIFIED` flagging; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

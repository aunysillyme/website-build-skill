# Gemini CLI

TEAM: one command installs the seven workers' files and subagent definitions; you open each session or invoke subagents from the main session and carry the handoffs between them. Researcher goes first.

This guide covers standalone Gemini CLI (`@google/gemini-cli`), which uses `.gemini/` paths and is separate from Google Antigravity (`agy`).
Check trusted-folder status and active policy settings before starting.
- Project install (`--scope project`): `npx website-build-skill --team --target gemini-cli --dir . --scope project --yes` (or `--solo`). This installs the skill to `.gemini/skills/website-build-skill/` and, in `--team` mode, generates seven subagent definitions under `.gemini/agents/website-<role>.md`.
- User install (`--scope user`): `npx website-build-skill --team --target gemini-cli --scope user --yes` installs the skill to `~/.gemini/skills/website-build-skill/` and, in `--team` mode, generates subagent definitions under `~/.gemini/agents/website-<role>.md`.
- Manual SOLO: copy the canonical folder into `.gemini/skills/website-build-skill/` (or `~/.gemini/skills/website-build-skill/`). Gemini CLI discovers project skills in trusted folders (and also reads `.agents/skills/` as an alias, which takes precedence if both exist).
- In an interactive session, run `/skills list` (or `/skills reload`) or `gemini skills list --all` from the terminal to confirm discovery; ask the session to read `SKILL.md` if needed.

## Subagents, context, hooks and commands

- Generated TEAM subagents live in `.gemini/agents/website-<role>.md` (project) or `~/.gemini/agents/website-<role>.md` (user) and can be invoked via `@website-researcher` (or automatic delegation).
- Recursion limit: Gemini CLI subagents cannot call other subagents, so the main session (or manual sessions via [manual relay](grok.md#manual-fallback)) coordinates Researcher-first order and stage handoffs.
- `website-reviewer.md` restricts `tools` to Gemini CLI's documented read-only built-in tools (`read_file`, `grep_search`, `glob`, `list_directory`, `google_web_search`, `web_fetch`), omitting `write_file`, `replace` and `run_shell_command`. The other six roles omit `tools` so they inherit parent session tools while following role file ownership.
- Context and instructions: Gemini CLI reads `GEMINI.md` in `~/.gemini/GEMINI.md` and workspace directories (configurable via `context.fileName` in `settings.json`). The installer detects an existing `GEMINI.md` router first for `--target gemini-cli`.
- Hooks and custom commands: optional lifecycle guardrails live in `.gemini/settings.json` / `~/.gemini/settings.json` (for example `BeforeTool` hooks) and optional prompt shortcuts live in `.gemini/commands/*.toml` / `~/.gemini/commands/*.toml`. Neither is created by this package's installer.
- References: [skills](https://geminicli.com/docs/cli/skills) and [subagents](https://geminicli.com/docs/core/subagents).

## Check that it loaded

Native loading on this host is awaiting a real-client trial; the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record `@google/gemini-cli` version, date, exact path, folder trust status, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and actual model families; if a second model family is unavailable, record `independent-review: INTERNAL (UNVERIFIED)` rather than claiming independent review.
Never grant Reviewer write access just to persist findings. Return text for Coordinator to capture.
When web search is absent, return `query-plan.md` and `unresolved-claims.md` with `UNVERIFIED` flagging; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md), [installer contract](../docs/INSTALLER.md) and [Working with the tools you have](../skills/website-build-skill/playbooks/research-and-memory.md#working-with-the-tools-you-have).

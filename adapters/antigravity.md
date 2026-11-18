# Google Antigravity

TEAM: one command installs the seven workers' files and agent definitions; you verify each session, actual model family and handoff, or open sessions yourself. Researcher goes first.

Check the installed client's file access and session permissions before starting.
- Project install (`--scope project`): `npx website-build-skill --team --target antigravity --dir . --scope project --yes` (or `--solo`). This installs the skill to `.agents/skills/website-build-skill/` and, in `--team` mode, generates seven subagent definitions under `.agents/agents/website-<role>.md`.
- User install (`--scope user`): `npx website-build-skill --team --target antigravity --scope user --yes` installs the skill to `~/.gemini/config/skills/website-build-skill/` and, in `--team` mode, generates subagent definitions under `~/.gemini/config/agents/website-<role>.md`.
- Manual SOLO: copy the canonical folder into a new `.agents/skills/website-build-skill/`, the workspace skill folder in the [Antigravity skills docs](https://antigravity.google/docs/skills) (or `~/.gemini/config/skills/website-build-skill/` for user scope). If the skill is not listed, ask the session to read its `SKILL.md`.
- Plugin route: `agy plugin install https://github.com/aunysillyme/website-build-skill` stages the repository's `.claude-plugin/` metadata for Antigravity (`agy` CLI / App).

## Open the workers

Antigravity supports custom subagents in `.agents/agents/website-<role>.md` and `~/.gemini/config/agents/website-<role>.md`, transient subagents via `define_subagent`/`invoke_subagent`, and multi-agent orchestrators `/swarm` and `/teamwork`.
Generated subagent definitions set `subagent: true`, `mainAgent: false`, `commandExecutionPolicy: sandbox` (Antigravity's subagent default) on the six authoring/coordination roles, and `commandExecutionPolicy: off` with `tools: [read_file, search_web]` on `website-reviewer`.
Installing definitions does not launch active workers or supply a second model provider: start Researcher first, verify active session routes, actual model families and tool access, and carry handoffs through `/swarm` or the [manual relay](grok.md#manual-fallback) when running separate sessions.
If a second model family is unavailable (e.g. outside `/swarm` cross-model review or an external session), `independent-review: INTERNAL (UNVERIFIED)` may be recorded in the ship receipt rather than claiming independent review.

## Native tool mapping

Documented Antigravity native tools are listed below; confirm actual availability in your running session (host loading and TEAM execution remain awaiting a recorded trial).
Generated `.agents/agents/website-<role>.md` files omit `tools` on the six non-reviewer roles so optional browser or image tools do not trigger unmapped-tool hangs; `website-reviewer` explicitly sets `tools: [read_file, search_web]` and `commandExecutionPolicy: off`.

| Role | Documented native tools | Reason and permission scope | Fallback route ([Working with the tools you have](../skills/website-build-skill/playbooks/research-and-memory.md#working-with-the-tools-you-have)) |
| --- | --- | --- | --- |
| Researcher | `read_file`, `write_file`, `edit_file`, `search_web` | Read actual sources/repositories, research all domains, write only its library and handoffs, return the research receipt. | Web/image gaps: `query-plan.md` + `unresolved-claims.md` (`UNVERIFIED`), image generation/viewing, code execution/browser. |
| Coordinator | `read_file`, `write_file`, `edit_file`, `search_web` | Read artifacts and dated host evidence, write only owned coordination/capture paths, route handoffs. | Visual inspection and orchestration: image generation/viewing and separate workers (`/swarm`, `/teamwork`, `define_subagent`/`invoke_subagent`). |
| Designer | `read_file`, `write_file`, `edit_file`, `search_web`, `browser`, `image-generator` | Read brand inputs, top up design research, write owned brand/mockup specifications and handoffs. | Missing image/browser tools: image generation/viewing and code execution/browser. |
| Graphics | `read_file`, `write_file`, `edit_file`, `search_web`, `browser`, `image-generator` | Verify current tool rights and formats, read supplied assets, write owned asset specifications/manifests and handoffs. | Missing image/export inspection: image generation/viewing and code execution/browser. |
| Builder | `read_file`, `write_file`, `edit_file`, `run_command`, `search_web`, `browser` | Read implementation and stack sources, run `commandExecutionPolicy: sandbox` builds/checks, write owned implementation/QA outputs and handoffs. | Missing shell/browser/deploy: code execution/browser and deploy access handoffs. |
| Optimizer | `read_file`, `write_file`, `edit_file`, `run_command`, `search_web`, `browser` | Inspect source HTML, top up current SEO/AEO, run discovery checks, write owned discovery artifacts and handoffs. | Missing validators/browser/analytics: code execution/browser handoffs. |
| Reviewer | `read_file`, `search_web` (`commandExecutionPolicy: off`) | Read candidate and current attack/standards evidence; return findings for Coordinator capture. No filesystem writes or shell execution. | Reproduction and rendered/scanner checks go to a capable runner; cross-family review or `INTERNAL (UNVERIFIED)` disclosure. |

## Settling checks

- Open each complete role file or generated agent definition; record exact client version, skill path and `.agents/rules/*.md` or `.agents/hooks.json` state if configured.
- Verify `commandExecutionPolicy: off` and excluded write/shell tools on `website-reviewer`; unchanged bytes are required.
- Probe image inspection, `image-generator`, `browser`, `run_command` sandbox rules and `search_web` separately.
- Verify handoffs, `/swarm` or `define_subagent`/`invoke_subagent` routing, concurrency limits and Researcher-first order before downstream work.
- Preserve source bytes and return a path-by-path receipt. Missing web access records `query-plan.md` + `unresolved-claims.md` with `UNVERIFIED` disclosure.
- References: [skills](https://antigravity.google/docs/skills), [subagents](https://antigravity.google/docs/subagents), [CLI /agents command](https://antigravity.google/docs/cli/commands/agents).

## Check that it loaded

Native loading on this host is awaiting a real-client trial; the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and actual model families; if a second model family is unavailable, record `independent-review: INTERNAL (UNVERIFIED)` rather than claiming independent review.
Never grant Reviewer write access just to persist findings. Return text for Coordinator to capture.
When web search is absent, return `query-plan.md` and `unresolved-claims.md` with `UNVERIFIED` flagging; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

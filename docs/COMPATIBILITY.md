# Compatibility

## Evidence status, permissions and tools

- **Evidence:** native SOLO loading has one recorded run per host in [tested-host compatibility](#tested-hosts), under the operator's existing configuration. Crumb & Co adds one SOLO demo through Prove on Claude Code, with partial and blocked gates. The complete twelve-stage route, TEAM, generated subagent execution, account tools, independent-review access and deployment remain UNVERIFIED until real trials cover them. Other hosts have documented setups awaiting trials.
- **Codex sandbox:** its receipt used a read-only sandbox and exercised loading only. Check the current session's file, shell, network and browser permissions before building; the skill grants no permissions, and Codex subagents inherit the parent turn's sandbox and approval settings.
- **Tools:** current research uses web access to opened sources. When web access is unavailable, record `query-plan.md` and `unresolved-claims.md`, mark current web claims `UNVERIFIED`, and proceed with explicit disclosure (never mark offline guesses `OPENED` or `PASS`). BM04 needs a browser capture, so a host without a browser stays BLOCKED at Mock. Executing builds and automated checks needs a shell; missing tools require named handoffs and returned evidence before the relevant gate can pass. If a second model family is unavailable, `independent-review: INTERNAL (UNVERIFIED)` is permitted in the ship receipt rather than claiming independent review.
- **Proof:** local repository tests check files and rules. They do not prove an AI follows the full method or produces a finished site. The five [eval prompts](https://github.com/aunysillyme/website-build-skill/blob/main/evals/evals.json) are repo-only evaluation specifications, not completed runs or packaged installer inputs. See [evaluation](EVALUATION.md).

## Tested hosts

Three hosts have a dated native-loading receipt. Each covers SOLO skill discovery and loading
on the exact version below, from one run under the operator's existing client configuration
(each receipt lists its limitations); the full SOLO build route, TEAM and deployment stay
documented until a trial records them.

| Host | Version and system | Mode and scope | Date | Receipt |
|---|---|---|---|---|
| Claude Code | 2.1.281, macOS 26.6.2 arm64 | SOLO, native loading tested | 2026-09-24 | [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-claude-code-2026-09-24.json) |
| Codex CLI | 0.154.0, macOS 26.6.2 arm64 | SOLO, native loading tested | 2026-09-24 | [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-codex-2026-09-24.json) |
| Grok Build CLI | 1.0.40, macOS 26.6.2 arm64 | SOLO, native loading tested in a trusted folder | 2026-09-24 | [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-grok-build-2026-09-24.json) |

Every other host has a documented setup and
a check you run, in its own adapter guide, to confirm it loaded on yours. A host moves from
documented to tested when its receipt records the client/runtime version, trial date,
operating system, package revision, installed paths and hashes, invocation, observed
output, failure cases and remaining checks, kept sanitized in this repository.
Hosted repository checks have a [revision-bound baseline receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/audit-baseline.json).

## Hosts with a documented setup

These guides describe file-copy, installer, subagent, upload and manual-session routes. Their official documentation
links are verification targets for a client trial. A documented setup becomes a tested-host entry
when its receipt demonstrates loading, file access, tool permissions and the selected workflow.

| Host | Setup guide | What to verify | Official reference |
|---|---|---|---|
| Claude Code | [Skill, subagents or plugin](../adapters/claude-code.md) | `.claude/skills/` and `.claude/agents/` (`disallowedTools` on reviewer), invocation, assets and worker isolation | [Skills](https://code.claude.com/docs/en/skills) |
| Codex | [Skill, subagents and router](../adapters/codex.md) | `.agents/skills/` and `.codex/agents/` TOML files, inherited parent sandbox, role config and actual model family | [Skills](https://learn.chatgpt.com/docs/build-skills) |
| Hermes | [Skill, delegation and plugin](../adapters/hermes.md) | Project `.agents/skills/` vs `--scope user` `~/.hermes/skills/`, trust, `delegate_task` (`profile_routes`) and permissions | [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |
| Google Antigravity | [Skill, subagents, /swarm or plugin](../adapters/antigravity.md) | Project `.agents/skills/` & `.agents/agents/` vs `--scope user` `~/.gemini/config/`, `sandbox`/`off` policies and `agy plugin install` | [Subagents](https://antigravity.google/docs/subagents) |
| Gemini CLI | [Skill, GEMINI.md and subagents](../adapters/gemini-cli.md) | Project `.gemini/skills/` & `.gemini/agents/` vs `--scope user` `~/.gemini/`, trusted folders, `BeforeTool` hooks and read-only reviewer tools | [Skills](https://geminicli.com/docs/cli/skills) |
| Grok Bot | [Private skill and six-Bot group](../adapters/grok.md#grok-bot) | `Connect apps` -> `Private skills`, chat instructions, role files in `/workspace`, group routes; external Reviewer or `INTERNAL (UNVERIFIED)` | [Bots](https://docs.x.ai/grok-bot/bots) |
| Claude Desktop | [Bundle attachments](../adapters/claude-desktop.md) | Account upload controls and loaded resources | [Skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| ChatGPT Project/custom GPT | [Instructions and bundles](../adapters/chatgpt-project.md) | File access, tool availability and state reattachment | [Projects](https://help.openai.com/en/articles/10169521-projects-in-chatgpt) |
| Generic file-reading agent | [Explicit core pointer](../adapters/agents-md.md) | Router read-back and preserved instructions | [Adapter](../adapters/agents-md.md) |

## Evidence to collect

- **Documentation:** save the opened official source, version, access date and setup facts it supports.
- **Native loading:** record the actual entrypoint and every resource the client can read.
- **TEAM:** one command installs the seven workers' files (plus native subagent files on supported targets); verify running sessions, separate routes, setup acknowledgements, model families and permission probes.
- **Delivery:** record fresh package installs for each operating system being claimed, including Linux and Windows.
- **Uploads and URLs:** verify account ZIP controls and raw-URL retrieval in the actual client.
- **Runtime:** the package declares Node 22 or newer (`>=22`); [the check workflow](https://github.com/aunysillyme/website-build-skill/blob/main/.github/workflows/check.yml) defines its runtime matrix.

## Working with the tools you have

The [canonical tool table](../skills/website-build-skill/playbooks/research-and-memory.md#working-with-the-tools-you-have)
supplies the next step for research, saved files, visual mockups, measurements, independent review and release.
Each stage resumes when its required tool output or evidence is available.

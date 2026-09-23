# Compatibility

## Tested hosts

No host below has a completed real-client trial yet. Each host has a documented setup and
a check you run, in its own adapter guide, to confirm it loaded on yours. A host moves from
documented to tested when its receipt records the client/runtime version, trial date,
operating system, package revision, installed paths and hashes, invocation, observed
output, failure cases and remaining checks, kept sanitized in this repository.
Hosted repository checks have a [revision-bound baseline receipt](evidence/audit-baseline.json).

## Hosts with a documented setup

These guides describe file-copy, upload and manual-session routes. Their official documentation
links are verification targets for a client trial. A documented setup becomes a tested-host entry
when its receipt demonstrates loading, file access, tool permissions and the selected workflow.

| Host | Setup guide | What to verify | Official reference |
|---|---|---|---|
| Claude Code | [Skill or plugin](../adapters/claude-code.md) | Discovery, invocation, assets and worker isolation | [Skills](https://code.claude.com/docs/en/skills) |
| Codex | [Skill and explicit router](../adapters/codex.md) | Shared destination, role configuration and actual model family | [Skills](https://learn.chatgpt.com/docs/build-skills) |
| Hermes | [Skill and separate sessions](../adapters/hermes.md) | Trust, alias semantics, routes and inherited permissions | [Skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |
| Antigravity | [Explicit core pointer](../adapters/antigravity.md) | Schema, paths, quoted off, routing and denied writes | [Subagents](https://antigravity.google/docs/subagents) |
| Grok Bot | [Bundles and manual roles](../adapters/grok.md) | Account controls, routes and image relay | [Bots](https://docs.x.ai/grok-bot/bots) |
| Claude Desktop | [Bundle attachments](../adapters/claude-desktop.md) | Account upload controls and loaded resources | [Skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| ChatGPT Project/custom GPT | [Instructions and bundles](../adapters/chatgpt-project.md) | File access, tool availability and state reattachment | [Projects](https://help.openai.com/en/articles/10169521-projects-in-chatgpt) |
| Generic file-reading agent | [Explicit core pointer](../adapters/agents-md.md) | Router read-back and preserved instructions | [Adapter](../adapters/agents-md.md) |

## Evidence to collect

- **Documentation:** save the opened official source, version, access date and setup facts it supports.
- **Native loading:** record the actual entrypoint and every resource the client can read.
- **TEAM:** record separate routes, setup acknowledgements, model families and permission probes.
- **Delivery:** record fresh package installs for each operating system being claimed, including Linux and Windows.
- **Uploads and URLs:** verify account ZIP controls and raw-URL retrieval in the actual client.
- **Runtime:** the package declares Node 18 or newer; [the check workflow](https://github.com/aunysillyme/website-build-skill/blob/main/.github/workflows/check.yml) defines its runtime matrix.

## Working with the tools you have

The [canonical tool table](../skills/website-build-skill/playbooks/research-and-memory.md#working-with-the-tools-you-have)
supplies the next step for research, saved files, visual mockups, measurements, independent review and release.
Each stage resumes when its required tool output or evidence is available.

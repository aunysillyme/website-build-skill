# Compatibility

Status vocabulary: DOCUMENTED requires opened official evidence; TESTED requires a recorded actual trial.
This repository currently makes no TESTED host claim. All package integrations below are UNVERIFIED.
Candidate interfaces come from the design specification; consult the linked official source before a live trial.

| Host | Manual payload | What to verify | Source |
| --- | --- | --- | --- |
| Claude Code | Complete skill or root plugin | Discovery, invocation, assets and worker isolation | [skills](https://code.claude.com/docs/en/skills) |
| Codex | Complete skill, explicit router | Shared destination, role configuration, real family | [skills](https://learn.chatgpt.com/docs/build-skills) |
| Hermes | Complete skill, separate sessions | Trust, alias semantics, routes, inherited permissions | [skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) |
| Antigravity | Explicit core pointer | Schema, paths, quoted off, routing, denied writes | [subagents](https://antigravity.google/docs/subagents) |
| Grok Bot | Five bundles, manual roles | Actual account controls, routes, image relay | [Bots](https://docs.x.ai/grok-bot/bots) |
| Claude Desktop | Five bundles; future skill ZIP | Account upload controls and loaded resources | [skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude) |
| ChatGPT Project/custom GPT | Instructions plus five bundles | File access, tool availability, state reattachment | [Projects](https://help.openai.com/en/articles/10169521-projects-in-chatgpt) |
| Generic file-reading agent | Explicit core pointer | Router read-back and preserved instructions | [adapter](../adapters/agents-md.md) |

## Evidence required per row

Record exact client/runtime version, actual trial date, operating system, artifact revision,
installed file list and hashes, invocation, observed outputs, negative cases and limitations.
Retain a sanitized receipt in this repository before promoting the claim.
Documentation alone cannot establish native loading, enforcement or automatic worker creation.
Hosted CI, Linux/Windows trials, registry delivery, ZIP upload and raw-URL bootstrap remain UNVERIFIED.
The local maintainer runtime is Node 22.22.3. Consumer engine support is undeclared.

## Degradation

The [canonical missing-capability table](../skills/website-build-skill/playbooks/research-and-memory.md#missing-capability-table)
is included in method and team bundles. It keeps research, visual mockups, measurements,
independent review and release blocked when their required tools or evidence are missing.

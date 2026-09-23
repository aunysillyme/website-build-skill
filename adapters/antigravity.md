# Antigravity

Check the installed client schema, paths, orchestration and permissions before using native roles.
Manual SOLO: copy the canonical folder into `.website-build-skill/` and explicitly ask the session to read its SKILL.md.
Install the files: `npx website-build-skill --team --target antigravity --dir . --scope project --yes`.

## Planned definition contract

One complete canonical body per file at `.agents/agents/website-<role>.md`.
Never automatically fall back to the user-level candidate `~/.gemini/config/agents/`.

```yaml
---
name: <agent_name>
description: "<one line: what it does, when to use it, its permission boundaries>"
subagent: true
mainAgent: false
model: inherit
commandExecutionPolicy: "off"
tools:
  - <tool name>
  - <tool name>
---

# Agent System Instructions
<the complete canonical role body>
```

Resolve method references to `.website-build-skill/`; retain project-relative artifact paths.
Quote the policy string and round-trip all role text. Verify the declared policy with a permission probe.
Keep Coordinator dormant while the parent coordinates. `mainAgent: true` and worker creation need separate verification.
If the installed client exposes it, inspect with: `/agents`; then route the first assignment to Website Researcher.

## Candidate tool mapping

Use the supplied format as a design input and check it against the installed client.
Use only tools the installed client exposes. Check image viewing and code execution separately from text reading and file writing.

| Role | Declared observed tools| Reason and permission scope | Capability without an observed name; section 5.7 route |
| --- | --- | --- | --- |
| Researcher | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `codebase_search`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Read actual sources/repositories, research all domains, write only its library and handoffs, return the research receipt. | Image/page viewing and measurement runner: Image generation/viewing and Code execution/browser. |
| Coordinator | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Read artifacts and dated host evidence, write only owned coordination/capture paths, route handoffs. | Visual inspection and worker creation: Image generation/viewing and Separate workers. |
| Designer | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Read brand inputs, top up design research, write owned brand/mockup specifications and handoffs. | Image creation/viewing, contrast calculation, responsive inspection: Image generation/viewing and Code execution/browser. |
| Graphics | `view_file`, `list_dir`, `find_by_name`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Verify current tool rights and formats, read supplied assets, write owned asset specifications/manifests and handoffs. | Image generation/viewing and export/dimension inspector: Image generation/viewing and Code execution/browser. |
| Builder | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `codebase_search`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Read implementation and stack sources, write owned source/build instructions and handoffs. | Dependency/build/test execution, browser/screenshots, response/performance measurements, deploy: Code execution/browser and Deploy access. |
| Optimizer | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `codebase_search`, `search_web`, `read_url_content`, `write_to_file`, `send_message` | Inspect source HTML, top up current SEO/AEO, write owned discovery artifacts and handoffs. | Validators, rendered browser/response checks and authenticated analytics: Code execution/browser. |
| Reviewer | `view_file`, `list_dir`, `grep_search`, `find_by_name`, `codebase_search`, `search_web`, `read_url_content`, `send_message` | Read candidate and current attack/standards evidence; return findings for Coordinator capture. No filesystem writes, including findings. | Visual/test/scanner evidence inspection beyond text: Image generation/viewing and Code execution/browser; reproduction goes to a capable runner. |

## Settling checks

- Parse and discover every role; record exact client version and expanded candidate path.
- Probe excluded Reviewer writes and execution through every inherited route; unchanged bytes are required.
- Probe image inspection, generation, browser, build and source retrieval separately.
- Verify parent routing, concurrency limits and research-first handoffs without duplicate Coordinators.
- Preserve source bytes and return a path-by-path receipt. Missing capability produces BLOCKED work.
- References: [subagents](https://antigravity.google/docs/subagents), [agent manager](https://antigravity.google/docs/cli/commands/agents).


## Check that it loaded

Native loading on this host is awaiting a real-client trial; the check below confirms it on yours. Current status: [compatibility](../docs/COMPATIBILITY.md).

Give the host a synthetic brief and ask it to identify the entrypoint and complete asset list.
Record client version, date, exact path, tool availability and the observed invocation.
Start Researcher, verify saved library read-back, then confirm Coordinator waits for its gate.
For TEAM, record seven separate routes and families; an inherited family leaves independent review BLOCKED.
Never grant a Reviewer write access just to persist findings. Return text for Coordinator to capture.
When a tool is absent, keep current research BLOCKED until opened sources return; save and reattach named file bodies before the save gate; return inspected images before the visual gate.
Read the [method](../docs/METHOD.md), [compatibility](../docs/COMPATIBILITY.md) and [installer contract](../docs/INSTALLER.md).

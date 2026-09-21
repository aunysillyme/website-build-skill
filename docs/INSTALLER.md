# Installer contract

Status: planned and unavailable. No npm installer or native worker generator is implemented.
The source contracts reserve behavior; the executable placeholder exits nonzero and writes nothing.
The package metadata is private, has no bin entry, and is not a consumer package.

## Manual copy available now

Copy the complete `skills/website-build-skill/` directory into a new, empty destination:

| Target | Project destination | Activation status |
| --- | --- | --- |
| Claude Code | `.claude/skills/website-build-skill/` | UNVERIFIED; read back the entrypoint and assets |
| Codex | `.agents/skills/website-build-skill/` | UNVERIFIED; inspect discovery and invocation |
| Hermes | `.agents/skills/website-build-skill/` | UNVERIFIED; trust and shared discovery need a trial |
| Antigravity | `.website-build-skill/` | Explicit file-reading route; native definitions planned |
| Generic agent | `.website-build-skill/` | Ask it to read the entrypoint; preserve existing routers |
| Grok file-capable host | `.grok/skills/website-build-skill/` | UNVERIFIED; otherwise paste bundles |

Do not merge into a conflicting directory. Compare and preserve existing files first.
Copy a router pointer into existing project instructions only with authorization; do not replace them.
A copied file is prepared content. Discovery and activation require a separate read-back.
For chat-only hosts, attach the five bundles and use the [Project instructions](../adapters/chatgpt-project.md).

## Planned command interface

Planned, unavailable: `npx website-build-skill --solo --target codex --dir . --scope project --yes`.
Planned, unavailable: `npx website-build-skill --team --target antigravity --dir . --scope project --yes`.

- Choice: mutually exclusive `--solo` / `--team`; no arguments asks the canonical human question first.
- Target: `claude-code`, `codex`, `hermes`, `antigravity`, `grok`, `agents`, `chatgpt`, `portable`.
- Scope: project by default; user scope requires explicit selection, never implicit fallback.
- Destination: `--dir` is explicit; `--bundle-dir` is accepted only for the Hermes team alias.
- Output root: `--output-dir` sets where the work is saved, separately from where the skill is installed. No arguments asks the canonical human question: Obsidian vault folder, a folder on this computer, Notion, or a typed path. The answer is recorded once in the library's `scope.md`; `site-work/` is a name inside that root, not a fixed location.
- Notion: export destination only. The working copy stays on a filesystem, because the research gate and every role read their own files back by path. A Notion selection records both the on-disk working root and the export target, and reports which holds the authoritative copy.
- Writability: confirm the output root by writing and reading back before any sweep; an unwritable root fails without partial writes.
- Headless: `--yes` requires mode, target and destination; EOF and missing arguments fail without writes.
- Preflight: validate the entire intended output set before writes; reject symlinks, traversal and conflicts.
- Idempotence: identical bytes are a no-op; changed bytes produce a reviewable diff without overwriting.
- Dry run: `--dry-run` makes no writes, including directories, receipts or aliases.
- Runtime: planned offline execution after package retrieval; no telemetry, profiles, background tasks or lifecycle hooks.
- Receipt: list every actual path and digest, mode, target, definition and unresolved activation check.
- Integration: preserve existing routers and emit a named integration snippet; unmerged means activation pending.
- Interruption: record truthful partial results; never advertise an all-or-nothing transaction without evidence.
- Exit policy: planned 0 complete, 2 invalid input, 3 preflight conflict, 4 interrupted write, 5 activation pending. These are a design contract, not current installer behavior.
- Uninstall: planned receipt-based review, remove only unchanged owned files after authorization. Keep shared Codex/Hermes core while either receipt references it; unknown ownership means preserve.

## Native team branches

Generate complete canonical bodies, never independent role summaries.
Antigravity uses per-role Markdown only after schema, path and permission tests.
Hermes branch A requires verified declarative role support. Branch B uses separate-session packets and an explicitly scoped skill alias; alias loading never proves worker creation.
Both branches keep Researcher first, seven acknowledgements, a blocked downstream gate and a different-family Reviewer.
See [Antigravity](../adapters/antigravity.md), [Hermes](../adapters/hermes.md) and [team ownership](../adapters/team.yaml).

## Acceptance before implementation can be called ready

Run traversal, symlink, conflict, interruption, dry-run and router-preservation cases against a fresh package.
Run both shared-host install orders, aliases, manifest completeness and full role-body round trips.
Run fresh tarball and ZIP trials on Linux, macOS and Windows with exact runtime/client versions.
Record actual results before adding a bin entry, publishing or changing a compatibility row.

# Installer contract

Status: the installer is implemented; native worker generation is not.
`npx website-build-skill` copies the canonical files, verifies them by read-back and writes a
receipt of exactly what it wrote. It never creates a running agent, and host activation stays
UNVERIFIED until a real client trial. The manual copy route below still works and needs no Node.

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

## Command interface

Installs the files, activation still UNVERIFIED: `npx website-build-skill --solo --target codex --dir . --scope project --yes`.
Installs the files, activation still UNVERIFIED: `npx website-build-skill --team --target antigravity --dir . --scope project --yes`.

- Choice: mutually exclusive `--solo` / `--team`; no arguments asks the canonical human question first.
- Target: `claude-code`, `codex`, `hermes`, `antigravity`, `grok`, `agents`, `chatgpt`, `portable`.
- Scope: project by default; user scope requires explicit selection, never implicit fallback.
- Destination: `--dir` is explicit; `--bundle-dir` is accepted only for the Hermes team alias.
- Output root: `--output-dir` sets where the work is saved, separately from where the skill is installed. No arguments asks the canonical human question: Obsidian vault folder, a folder on this computer, Notion, or a typed path. The answer is recorded once in the library's `scope.md`; `site-work/` is a name inside that root, not a fixed location.
- Notion: export destination only. The working copy stays on a filesystem, because the research gate and every role read their own files back by path. A Notion selection records both the on-disk working root and the export target, and reports which holds the authoritative copy.
- Writability: confirm the output root by writing and reading back before any sweep; an unwritable root fails without partial writes.
- Headless: `--yes` requires mode, target and destination; EOF and missing arguments fail without writes.
- Preflight: validate the entire intended output set before writes; reject symlinks, traversal and conflicts.
- Paths: the project root you name is canonicalized, so a symlinked ancestor such as macOS `/tmp` installs normally. Every segment at or below that root is refused when it is a symlink, because that is what a third party can plant in an install target.
- Idempotence: identical bytes are a no-op; changed bytes produce a reviewable diff without overwriting.
- Dry run: `--dry-run` makes no writes, including directories, receipts or aliases.
- Runtime: offline after package retrieval; no telemetry, profiles, background tasks or lifecycle hooks.
- Receipt: list every actual path and digest, mode, target, definition and unresolved activation check.
- Integration: preserve existing routers and emit a named integration snippet; unmerged means activation pending.
- Interruption: record truthful partial results; never advertise an all-or-nothing transaction without evidence.
- Exit policy: 0 complete, 2 invalid input, 3 preflight conflict, 4 interrupted write, 5 activation pending. 5 is a completed install whose integration snippet is unmerged, not a failure.
- Uninstall: receipt-based, removing only owned files whose bytes still match the receipt. A changed file is kept and named; a file the receipt does not list is kept and named. Unknown ownership means preserve.

## Native team branches

Generate complete canonical bodies, never independent role summaries.
Antigravity uses per-role Markdown only after schema, path and permission tests.
Hermes branch A requires verified declarative role support. Branch B uses separate-session packets and an explicitly scoped skill alias; alias loading never proves worker creation.
Both branches keep Researcher first, seven acknowledgements, a blocked downstream gate and a different-family Reviewer.
See [Antigravity](../adapters/antigravity.md), [Hermes](../adapters/hermes.md) and [team ownership](../adapters/team.yaml).

## What is proven, and what is not

Proven by the test suite and by hand on macOS: traversal and symlink refusal at and below the
project root, whole-set conflict refusal, idempotent reruns, dry run writing nothing, an
unwritable output root failing before any skill file, receipt digests matching the bytes on
disk, uninstall keeping a changed file, router files left untouched with exit 5.

Not proven by anyone: host discovery or activation on any client, a fresh tarball trial on
Linux or Windows, and the native worker generation described below. Record actual results
before changing a compatibility row.

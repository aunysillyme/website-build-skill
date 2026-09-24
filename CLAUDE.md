# Claude entrypoint

For website work, follow [AGENTS.md](AGENTS.md) and [the canonical skill](skills/website-build-skill/SKILL.md).
Consume the human's recorded choice. Researcher starts before Coordinator or design.
Keep website output in the authorized project, separate from this repository.

For repository work, follow [CONTRIBUTING](CONTRIBUTING.md).

```sh
node scripts/build.mjs
node scripts/check.mjs
node --test test/*.test.mjs
```

The installer is real; the native worker generator is not. Do not imply seven workers start.
Native SOLO loading is tested on Claude Code and Codex (one run each, receipts in docs/evidence/).
Other hosts, TEAM, account tools and independent-review access are UNVERIFIED until a real trial.

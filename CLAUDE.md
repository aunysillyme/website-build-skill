# Claude entrypoint

For website work, follow [AGENTS.md](AGENTS.md) and [the canonical skill](skills/website-build-skill/SKILL.md).
Consume the human's recorded choice. Researcher starts before Coordinator or design.
Keep website output in the authorized project, separate from this repository.

For repository work, follow [CONTRIBUTING](CONTRIBUTING.md).

```sh
node --experimental-strip-types scripts/build.ts
node --experimental-strip-types scripts/check.ts
node --experimental-strip-types --test test/*.test.ts
```

The installer and native worker generator are planned. Do not imply they exist.
Native loading, account tools and independent-review access are UNVERIFIED until a real trial.

# Repository settings

Live read-back, not a plan. Every row below was read from the GitHub API on 2026-09-21
(America/New_York) with `gh api`, and the settings applied that day were applied deliberately
by the maintainer. Rerun the commands in [Read it back yourself](#read-it-back-yourself) before
trusting any row; a checklist is only as current as its last read.

## Description

- [x] Repository description set to this one line. Read back 2026-09-21; it matches.

Research-first website-building skill: learn the craft, match the brand, compare three mockups, then build and verify. Use one AI or a seven-role team with reusable research, design, accessibility, SEO and release checklists.

## Topics

- [x] All twenty topics below are applied. Read back 2026-09-21. They describe adapter coverage and method scope, not verified host support.

- agent-skills
- ai-skills
- llm-skills
- claude-skills
- skill-pack
- web-design
- web-development
- claude-code
- codex
- chatgpt
- grok
- antigravity
- multi-agent
- accessibility
- web-performance
- seo
- aeo
- design-systems
- brand-design
- research-workflow

## Creation and access

- [x] Name: `website-build-skill`.
- [x] Visibility: public since 2026-09-21T17:49:06Z, after the privacy and content gates passed.
- [x] Default branch: `main`.
- [x] Issues: ON; blank issues OFF through the supplied template configuration.
- [x] Discussions: OFF. No maintainer is staffing one.
- [x] Private vulnerability reporting: ON. The API reports it enabled; the report form itself is UNVERIFIED.
- [x] Wiki: OFF. Applied 2026-09-21; the method and process documentation stays in this tree.
- [x] Repository link: https://github.com/aunysillyme/website-build-skill.

## Review and automation

Branch protection on `main` was applied 2026-09-21 in its administrator-bypassable form, so a
sole maintainer can still push directly while force pushes, deletions and a red check cannot land.

- [x] Require the `Repository checks` status, strict, on `main`. The context was established by real runs before the rule.
- [x] Block force pushes and branch deletion.
- [x] Require resolved review conversations.
- [x] Read-only default workflow token permissions; workflows cannot create or approve pull requests.
- [x] Dependency alerts and automated security updates: ON, applied 2026-09-21. Action update proposals arrive as Dependabot pull requests.
- [x] Secret scanning and push protection: ON.
- [x] Every action in this tree is pinned to a full commit SHA, and `ACTION_PIN` fails the check when one floats.
- [ ] Administrator enforcement stays OFF by decision, because requiring review with one maintainer would block that maintainer's own work. Revisit when a second reviewer exists.
- [ ] Require pull requests and an approving review for `main`: not applied, same reason.
- [ ] Require code-owner review for source, workflow and publication changes: not applied.
- [ ] Restrict the repository to selected actions, or require SHA pinning at the repository level: not applied. `allowed_actions` is `all`; the pinning that exists is in the workflow files.
- [ ] Publication setup: release.yml implements publishing on a matching version tag; only its publish job receives id-token: write. Registry bootstrap and trusted-publisher configuration require maintainer completion. No publication is established by the baseline receipt.
- [ ] Maintainer notifications for failed Actions runs: delivery UNVERIFIED, no intentional safe failure has been sent.

## Social preview

- [ ] Produce a social preview image: 1280 x 640 pixels, PNG or JPEG. Not produced; the repository serves the default generated image.
- [ ] Show the project name, Research to Mock to Build to Prove, and a readable visual hierarchy.
- [ ] Review crop, contrast, rights and private-data absence before upload.
- [ ] Confirm current GitHub image constraints in the creation UI before applying them; account behavior is UNVERIFIED.

## Community profile

- [x] Community profile health: 100 percent, read 2026-09-21, with README, LICENSE, CONTRIBUTING, CODE_OF_CONDUCT and a pull request template detected.
- [x] Issue forms live in `.github/ISSUE_TEMPLATE/`. The profile API reports `issue_template` absent because it looks for a single legacy file, not the forms directory.

## Read it back yourself

```bash
REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api "repos/$REPO" --jq '{private,has_wiki,has_issues,has_discussions,default_branch,description,topics,security_and_analysis}'
gh api "repos/$REPO/branches/main/protection"
gh api "repos/$REPO/community/profile" --jq '.health_percentage'
gh api "repos/$REPO/actions/permissions/workflow"
```

Record the actual status and its date. Do not claim a setting this token cannot see.

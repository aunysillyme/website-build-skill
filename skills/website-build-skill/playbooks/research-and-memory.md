# Research and memory

Establish the engagement date, build the evidence library, then release work.

## ASK DATE rule

Establish ASK DATE (the engagement start date) before intake or research, and record it once in `site-work/research/library/scope.md` (later roles read `scope.md`). Never ask the user when a host or shell clock is available, and never guess from model memory.

1. **System clock / host date:** Use a host-supplied date (`host-environment`) or run `date -u '+%Y-%m-%dT%H:%M:%SZ'` (`system-clock`; on Windows: `powershell -NoProfile -Command "[DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')"`). **A local rung wins:** a fetched date later than the local clock is rejected, and a fetched source never moves ASK DATE.
2. **Fallback rungs (`user-supplied` only without a clock):** Only if neither `host-environment` nor `system-clock` is available, fall back to `http-date` (needs corroboration from a second independent host within 24 hours), `filesystem-mtime` (`.ask-date-probe`), `derived-floor` (latest credible opened source date, labeled `Research as of derived-floor <date>`), or `user-supplied` when no clock/shell exists.
3. **Unavailable (`unavailable`):** If no date or live web source can be established, write `query-plan.md` and `unresolved-claims.md`, flag dependent web claims `UNVERIFIED`, and proceed only with explicit disclosure (never mark offline guesses `OPENED` or `PASS`).

Per-claim discipline: every claim records `published: <date | unknown>` and `accessed: <date>` (from an actual source open on or after ASK DATE), with `Research as of <ASK DATE>` at the top of each library file.

## Freshness windows relative to ASK DATE

| Domain | Freshness window relative to ASK DATE | Why this window and what triggers an earlier recheck |
| --- | --- | --- |
| 1. Reference codebases and real implementations | 30 days for pattern comparisons; verify revision and maintenance status at first reuse. | New revision, license or security advisory triggers a recheck. |
| 2. Stacks and frameworks | 7 days for landscape comparisons; same-day check for selected versions, APIs, deprecations and support. | Confirm the current supported version before coding against it. |
| 3. Design | 365 days for typography, colour theory, gestalt and grids; 90 days for awards, trends and anti-trends. | Award selection covers the last two to three years relative to ASK DATE. |
| 4. Graphics skills | Same-day check for tool capabilities, pricing, commercial rights per tier and destination specs; 90 days for export craft. | Product tiers, safe zones and rights can change without changing a tool's name. |
| 5. UI and UX | 180 days for tested interaction principles; 30 days for browser/device interaction behavior. | New input mode, audience or observed usability failure triggers a recheck. |
| 6. Accessibility | 365 days for fundamentals; current-version check at first reliance and after 30 days. | Confirm the current standard release, target level and errata as of ASK DATE. |
| 7. Performance | 30 days for measurement strategy; same-day check for CWV thresholds, metric definitions and selected tooling. | Metric semantics and measurement tools can change; separate field from lab results. |
| 8. SEO | 7 days for general documented behavior; same-day check for search features, schema eligibility and indexing interfaces. | Platform announcements trigger immediate recheck. |
| 9. AEO and AI citation | Same-day check for crawler policies, citation behavior, search behavior and proposal adoption. | Consumer behavior and documentation change quickly. |
| 10. Security | 7 days for the threat landscape; same-day check for advisories, host header/CSP syntax and scanner criteria. | Surface changes trigger immediate review. |
| 11. Hosting, deploy and DNS | Same-day check for platform capabilities, plan prices/restrictions, header syntax and deploy configuration; 90 days for DNS fundamentals. | Recheck the actual target before release. |
| 12. Measurement | 30 days for setup and interpretation guidance; same-day check for selected event APIs, consent settings and receiving-property behavior. | Changed instrumentation or property triggers verification. |
| 13. Legal, kept light | Same-day check for exact font/stock/AI tool licenses and intended-use rights; 30 days for background guidance. | Changed terms or jurisdiction triggers review. |
| 14. Languages and coding practice | Same-day check for selected language, runtime and framework versions, Baseline status, and security advisories; 30 days for tooling; 365 days for fundamentals. | A selected-version, browser-target or security change triggers an earlier recheck. |


## Build research that someone can apply

Question: which facts change this site's design, implementation, or release?

- Standards: search dated claims, open each cited source, and preserve source and access dates separately.
- Areas: execute every numbered domain in prompts/01-website-deep-research.md.
- Depth: examine actual repository files at an identified revision, not only project descriptions.
- Interpretation: turn each brief word into a testable visual decision and an alternative.
- Evaluation: compare evidence of user task completion separately from aesthetic preference.
- Extraction: separate observed values, inferred roles, approved rules, and unresolved conflicts.
- Save: write the library and propose durable memory as two separate destinations.
- Close: report surprising findings with claim IDs, then request only still-missing design inputs.
- Order: Researcher is agent one; no downstream role starts until Researcher completes its disk library (passing AD01-AD08 or explicitly disclosing offline `UNVERIFIED` limits with `query-plan.md` and `unresolved-claims.md`).

## Write a claim ledger

Use templates/evidence.md for each claim that could change a decision.
Record claim ID, domain, statement, URL, source date and kind, actual access event,
supporting passage or repository revision, applicability, confidence, and dependents.
A search result is a discovery lead. Open its source before recording it as evidence.
Label evidence, inference, proposed default, measurement, and UNVERIFIED separately.
A proposed default can guide a draft only when no blocked external claim supports it.

Use this exact table header in `sources.md`; keep applicability and evidence kind
in the per-claim record. Escape literal pipes in table cells with a backslash.

```text
| Claim ID | Domain | Statement | URL | Published | Accessed | Status | Dependents |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

Use stable `CLAIM-` IDs containing only letters, digits, underscores and hyphens.
Status is `OPENED` only with a receipt, otherwise `UNVERIFIED`. A `Verified` label
without a receipt fails the gate; it cannot stand in for proof of a fetch.

**Fetch receipts.** At fetch time, write one receipt per cited claim's opened
source to `research/library/receipts/<CLAIM-ID>.md`, relative to `site-work/`.
Never reconstruct receipts later or mark a claim OPENED from memory or a search
snippet. Search results are discovery leads; the page itself must be fetched.
The receipt starts with the library's dated opener, followed by these plain fields:

```text
url: <exact URL in the claim row>
fetched_at: <UTC timestamp from the environment, YYYY-MM-DDTHH:MM:SSZ>
tool: <fetch tool actually used>
result: <HTTP status or actual tool outcome>
published: <date copied verbatim from the excerpt, or unknown>
excerpt: |
  <verbatim supporting page passage of at least 80 characters>
```

Indent each excerpt line by two spaces. Include quoted page date text in the
excerpt when claiming a publication/update date; otherwise use `unknown`. The
row's Published value must match the receipt's published value exactly. Optional
milliseconds in fetched_at use three digits before Z. If the environment cannot
supply a UTC timestamp, leave that claim UNVERIFIED; never invent precision.
An existing qualified ASK DATE does not authorize a fabricated fetch timestamp.

**Check before reliance.** Use this checker ladder:

1. `website-build-skill check-library <root>/site-work`, when that command is on PATH.
2. Otherwise `npx -y website-build-skill@<packageVersion> check-library <root>/site-work`, where `<packageVersion>` is read from the installed `manifest.json`. Never write the literal version into prose, or it goes stale on every bump.
3. From a repository checkout: `node bin/website-build-skill.mjs check-library <site-work-dir>`.
4. When no rung can run, meaning no shell, no PATH command and npx fails or has no network: Reviewer records the five-rule manual equivalent. Also record each rung tried, with its command, exit code and output, as the reason.

For every rung that runs, save the command, exit code and output. PASS still needs exit 0 from a mechanical rung, or a recorded manual equivalent for rung 4. Acted-on UNVERIFIED claims cannot earn PASS (if web access is unavailable, proceed only with `query-plan.md`, `unresolved-claims.md`, and explicit `UNVERIFIED` disclosure).

Save the ladder evidence with the research gate evidence. Exit 0 means
receipt consistency, not proof that a passage is true or supports a decision;
exit 2 reports problems, one per line. The checker lists UNVERIFIED rows even
when it exits 0. Any acted-on UNVERIFIED claim cannot pass AD07.
For rung 4, Reviewer records the same five checks in
checklists/research.md by hand. Independent AD09 re-fetching remains required.

Example: a provider's paid-tier export right needs the exact tier's current terms,
the asset's origin, intended use, a source-opening receipt, and required notices.
A review of the provider's image quality cannot establish any of those rights.

When sources disagree, record both claim IDs, dates, scopes, and the affected decision.
Do not average incompatible claims or pick the most convenient answer.
Prefer the authoritative source for the exact version or tier, and record why.
If evidence cannot settle a material conflict, block that decision with a next action.

## Choose where the work is saved

Read outputRoot and optional outputStorage from the install receipt before the first write.
Reuse that choice without asking again. If it is absent, ask the human using
templates/install-choice.txt: an Obsidian vault folder, local folder, Notion export, or
another local destination. An explicitly accepted default uses the website project folder;
a missing answer is not consent. Researcher records the root and any export target in
site-work/research/library/scope.md beside ASK DATE. Every project path, including
site-work/, resolves inside that root. Later roles read this record instead of choosing again.

An Obsidian vault and a plain folder both work directly, because the library is Markdown on disk.
Notion is an export destination, never the working copy: the research gate, the prior-library pass
and every role read their own files back by path, and a page in a workspace API cannot serve that
read-back. Keep the working copy on disk and export the finished library, recording the export the
same way as any other save, with status and read-back. Announce that split when Notion is chosen,
and record which destination holds the authoritative copy.

Confirm the root is writable by writing `<root>/site-work/research/library/scope.md`
and reading it back before the sweep begins.

## Produce the complete library

All paths below belong to the user's authorized project, never the installed skill.
They resolve inside the workspace root the human chose; site-work/ is a name under it, not a fixed location.
Researcher owns the library and its revisioned research receipts.
Library Markdown, including each domain checklist, uses the mandatory dated opener.

```text
site-work/
  research/
    library/                              Researcher-owned canonical library.
      README.md                           Dated index, headline findings, role reading map.
      scope.md                            ASK DATE, ladder rung/raw evidence, workspace root, request, tools, applicability.
      coverage.md                         Fourteen domains, files, checklist and source coverage.
      01-codebases-and-stacks.md           Domains 1 and 2; code reads and current stacks.
      02-design-and-experience.md          Domains 3 and 5; design and UI/UX.
      03-graphics-and-rights.md            Domains 4 and 13; graphics and light legal.
      04-accessibility-and-performance.md Domains 6 and 7; standards and measurement.
      05-search-and-answers.md             Domains 8 and 9; SEO and AEO.
      06-security-and-delivery.md          Domains 10 and 11; threats, hosts, deploy, DNS.
      07-measurement-and-operations.md     Domain 12; analytics and operational follow-through.
      08-languages-and-code.md             Domain 14; language support, coding practice and verification.
      sources.md                          Claim IDs, opened URLs, source/access dates, scope.
      receipts/
        <CLAIM-ID>.md                     Per-claim page fetch fields and verbatim supporting excerpt.
      disagreements.md                    Conflicting sources, affected decisions, dispositions.
      query-plan.md                       Search questions and missing-source actions.
      unresolved-claims.md                UNVERIFIED claims and blocked downstream decisions.
      how-to-read-a-brand-kit.md           Evidence into checkable design decisions.
      website-qa-checklist.md              Cross-domain blocker-first index of applied checks.
      surprises.md                        Short findings and implications for the user.
      staleness.md                        Fourteen freshness windows relative to ASK DATE, earliest expiry, reuse decisions.
      learning.md                         Opened evidence, learned rules, applied checklist IDs.
      recipes.md                          Commands that actually ran, with tool version and what they produced.
      memory-proposal.md                  Durable rules and location, not a completed save.
      memory-receipt.md                   Save status, destination, read-back or pending action.
      checklists/
        01-codebases.md                   Inspected source, license, complexity, reuse.
        02-stacks.md                      Version/API evidence and justified dependencies.
        03-design.md                      Brand interpretation, tokens, three directions.
        04-graphics.md                    Per-tier rights, sizes, safe zones, inspected exports.
        05-ui-ux.md                       Task journeys, state coverage, mobile recovery.
        06-accessibility.md               Computed contrast and manual assistive-tech checks.
        07-performance.md                 Field/lab distinction and repeatable budgets.
        08-seo.md                         Crawl, canonical, schema, linking, sitemap.
        09-aeo.md                         Quotable answers, entities, crawler evidence.
        10-security.md                    Input/secret boundaries, host CSP, adverse cases.
        11-hosting.md                     Preview, DNS, HTTPS, rollback, plan restrictions.
        12-measurement.md                 Receiving-property proof and interpretation limits.
        13-legal.md                       Font, stock, AI imagery, trademark evidence.
        14-code.md                        Supported features, tests, tooling, dependencies and secure code.
    coordinator/                          Coordinator top-ups, flags, learning and QA receipts.
    designer/                             Designer top-ups, flags, learning and QA receipts.
    graphics/                             Graphics top-ups, flags, learning and QA receipts.
    builder/                              Builder top-ups, flags, learning and QA receipts.
    optimizer/                            Optimizer top-ups, flags, learning and QA receipts.
  handoffs/
    researcher/                           Versioned research gate receipts to Coordinator.
  review/                                 Coordinator captures read-only Reviewer returns.
    <revision>/                           Findings, research packet, handoff, capture envelope.
  MEMORY.md                               Coordinator's consolidated durable-memory proposal.
```

- Coverage: map all fourteen domains to grouped files, source claims, checks, and downstream owners.
- Exclusions: survey every domain; justify any project-specific NOT APPLICABLE check.
- Checklists: each domain check names criterion, method, expected evidence, claim IDs, owner, status, and exclusion reason.
- Blockers: website-qa-checklist.md collects unresolved critical checks before quality scoring.
- Learning: reopen written files and record which rules change the handoff.
- Recipes: when a command works, paste it into recipes.md with the tool and version it ran on,
  the input it took, and the output it produced. A later role runs the recorded command instead
  of re-deriving flags. A recipe is a record of one run, not a guarantee for a different version:
  re-check it against the installed tool before relying on it, exactly as with any example command.
- Read-back: verify the saved revision and links before issuing a research receipt.
- Privacy: keep runtime research, source assets, and private scope out of deployment output.

## Learn, ingest, then top up

Every downstream role starts with its WHAT YOU MUST LEARN filenames.
Read the actual library, its current revision, and the applicable domain checklists.
Record opened files, learned rules, changed assumptions, and applied check IDs in learning.md.
Top up only remaining questions in that role's domain using current source openings.
Read library/recipes.md before deriving an image, font, or build command, and append any
command you got working, with its tool version and result, in the same pass.
Write README.md, sources.md, top-up.md, flags.md, learning.md, applied-checklists.md,
memory-proposal.md, and memory-receipt.md in the role's owned research directory.
Reviewer returns these bodies read-only for unchanged Coordinator capture.

Send wrong or stale canonical claims to Researcher by claim ID, dated counterevidence,
affected decisions, and paused receipts. Only Researcher revises the shared library.
A new brief, host, tier, dependency, brand decision, or source correction invalidates
all affected downstream receipts until the relevant checks run again.

In SOLO, read the same full role bodies and do the same research and learning.
Write and reopen a self-handoff at every boundary using templates/handoff.yaml.
Name in framing_reset which prior assumption or design attachment you release.
Keep approved requirements; do not treat your previous suggestion as a user decision.

## Save durable rules separately

Keep volatile versions, prices, rights, and platform behavior in the dated library.
Propose durable rules such as computed contrast, three mockups, evidence-backed claims,
smallest justified stack, source-safe rendering, and different-family review.
Record the library location and refresh procedure so a later session can find it.

Use supported memory or project instructions only within existing authorization.
Record status as saved, declined, unsupported, or pending, with the exact destination.
For saved, record the operation receipt and read back the persisted content.
If save or read-back fails, record the failure and keep the proposal available.
Session context and an agent saying it learned something are not durable storage.
Coordinator may consolidate proposals into site-work/MEMORY.md without changing
another role's receipt or upgrading a pending save into a success.

## Continue without durable memory

Return a reattachment packet containing the brief, capability limits, library revision,
claim/source ledger, staleness schedule, approvals, stage status, and latest handoffs.
Include complete named bodies when the receiver cannot open file paths.
Tell the user which project mechanism can save the packet and which files to reattach.
Reopen the received files at the next session and run the prior-library or resumed-session
freshness procedure as appropriate. Missing disk persistence still blocks research.
Optional memory being unsupported does not invalidate a verified disk library.

## Working with the tools you have

| Tool | What it enables | Next step when it is absent |
| --- | --- | --- |
| Web search | Current-to-ASK-DATE research and revalidation, including a prior library. | Clarify the request, review supplied sources and plan queries. Write `query-plan.md` and `unresolved-claims.md`, flag current web claims `UNVERIFIED`, and disclose the limit when proceeding with available inputs (never mark offline guesses `OPENED` or `PASS`). |
| URL retrieval | Raw-URL bootstrap and opened-source citations. | Use a pasted or uploaded core method and ask the human for self-contained bundles. Cite sources after opening them. |
| File writing | Saved disk research and a local install confirmed by read-back. | Draft prompts, specifications and named file bodies. Return downloadable files or copyable labeled blocks for saving and read-back. |
| Persistent memory | Durable memory across future sessions. | Continue the current-session workflow and project documents. Return a `MEMORY.md` proposal plus explicit save/reattach steps. |
| Image generation/viewing | Three inspected visual mockups and visual approval. | Plan the brief and wireframes. Return a Designer handoff with required assets and criteria; complete visual approval after inspecting the images. |
| Code execution/browser | Measured contrast, functional tests, lab scores and live QA. | Draft implementation and a test plan. Return commands and exact expected evidence for a capable runner; record measured results after execution. |
| Separate workers | TEAM jobs and concurrent workers with verified independence. | Run sequential SOLO jobs, role learning and saved self-handoffs. Return a SOLO capability receipt and role-boundary packets. |
| Independent model family | Recommended cross-family adversarial review. | Run a read-only internal critique, prepare AUDIT_BRIEF and an immutable artifact, and record `independent-review: INTERNAL (UNVERIFIED)` in the receipt (optional when a second model family is unavailable; cross-family review still completes the independent gate). |
| Deploy access | Production release and live verification. | Prepare a reviewable local/preview artifact where available. Return an operations doc and authorized operator handoff for release and live checks. |

Check each tool separately. A working URL reader still needs separate browser,
image inspection, response-header and calculator checks. After installing role
definitions, verify running workers, tool permissions and the actual model families.
Record a session probe and result for host loading, orchestration, isolation,
memory and deployment before relying on each capability.

## Verify and hand off

Apply checklists/research.md AD01 through AD08, then R01 through R06.
Save the producer receipt and have Coordinator reopen its artifacts before acceptance.
Independent AD09 runs later, before shipment, rather than blocking agent one's start.
Every receipt names the library revision, scope provenance, relied-on claims,
source-opening evidence, earliest expiry, next owner, and unresolved limitations.
All applicable checks must pass; a persuasive summary does not replace the evidence.

## Failure modes

- Decorative research: no claim-to-decision map or usable domain checklist.
- False persistence: a proposal or inaccessible filename is called a saved library.
- Scope drift: a downstream role quietly selects a new tier or host without research.
- Stale handoff: a changed claim leaves dependent PASS receipts untouched.
- False independence: another persona in the same family approves its own work.

## Source and verification status

This playbook defines the method's evidence policy, not a claim about a live platform.
Source URLs and access events are recorded at runtime using templates/evidence.md.
External facts not opened and checked in the engagement remain UNVERIFIED.
Never report a measured, saved, installed, or deployed result without evidence.

# Inactive ASK DATE fixtures

Synthetic specification data, never active stage guidance. Behavioral model evaluation remains UNVERIFIED.

| RED case | Verbatim artifact string and context to REJECT | Check that rejects it |
| --- | --- | --- |
| 1 | Library opening `Research as of 2026-09-21` while `scope.md` records `ASK DATE: 2026-10-30`. | AD05: opening date must equal the scoped ASK DATE; old stamp fails. |
| 2 | Library opening `Research as of 2026-10-30` while all per-claim dates are `accessed: 2026-03-14`, with no completed revalidation. | AD03 and AD05: current accesses predate ASK DATE; a new stamp cannot substitute for source openings and reuse decisions. |
| 3 | `Core Web Vitals thresholds are LCP 2.5s, INP 200ms, CLS 0.1.` with no source URL and no access date. | AD04 and AD03: confident undated memory claim lacks source and access evidence; AD09 reports it as a finding. |
| 4 | `scope.md` contains `ASK DATE: assumed` or no `ASK DATE` line at all. | AD01: a real date and allowed provenance are required; both variants fail. |
| 5 | `scope.md` contains `ASK DATE: 2025-06-01` established by `I believe today is around mid-2025.` | AD01: model knowledge is not a ladder rung or raw external date evidence. |
| 5b | Any active prompt, role file or checklist asks for the date, for example `What is today's date?` or `Please confirm today's date before we begin.` | AD02: reject date solicitation in any phrasing; test paraphrases and perform semantic review, not only exact-string matching. |
| 5c | `scope.md` has an ASK DATE with no rung, or a rung of `assumed`, `from memory`, or `user-supplied`. | AD01: missing/disallowed rung and missing authentic evidence block the gate. |
| 6 | `published: 2026-08` where the opened page shows no publication date. | AD04: compare source-date assertion to page evidence; require `published: unknown`, never invention. |
| 7 | An active prompt, playbook, checklist or role file contains `research 2025-2026 award winning website designs`. | AD08: hardcoded recency in active content fails. The identical string inside `prompts/02-graphics-design-original.md` or a bounded verbatim public-post quote is correct to retain and must NOT be flagged; those contexts alone are exempt. |
| 8 | `query-plan.md` and `unresolved-claims.md` exist, no web access is available, but the research gate is `PASSED`. | AD07: recovery artifacts cannot satisfy current research; status must remain BLOCKED, including when an old library is supplied. |
| 9 | A downstream `top-up.md` has `accessed: 2026-05-02` under `ASK DATE: 2026-10-30`, with no revalidation line. | AD03 and AD05: stale top-up lacks current access and reuse decision; AD09 catches it again at ship review. |

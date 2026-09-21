# Claim and source evidence contract

Date rule: [ASK DATE and evidence provenance](../playbooks/research-and-memory.md#ask-date-rule).
This is a blank artifact contract. Fill it from actual inputs and evidence at runtime.
Unresolved required fields keep the relevant gate BLOCKED; never prefill a PASS.

## Library opening and scope

Every completed research Markdown file begins with Research as of the exact stored ASK DATE.
Apply the full derived-floor wording when only a lower bound is available.
This reusable contract is not a runtime research receipt.
Record the scope link, library revision, engagement identifier, producer role and actual family.

## Per-claim record

| Field | Required value and evidence |
| --- | --- |
| claim_id | Stable identifier referenced by decisions, checks and findings. |
| domain | One of the thirteen research domains, with additional scoped concerns as needed. |
| statement | Exact bounded claim, including relevant version, tier, consumer or use. |
| kind | Evidence, inference, proposed default, measurement, or UNVERIFIED. |
| source_url | Opened authoritative URL; a search snippet does not satisfy this field. |
| published | Source publication/update date and kind if visible, otherwise unknown. |
| source_date_proof | Supporting date text/location; never infer a date from footer, URL or HTTP header. |
| accessed | Actual opening date on or after ASK DATE within this engagement, or qualified derived floor. |
| opening_receipt | Tool/session event and supporting passage, file revision, or response evidence. |
| precision | Exact date/timezone supplied, or exact access unavailable plus opening sequence and lower bound. |
| applicability | Brief, version, tier, jurisdiction or content scope that makes this relevant. |
| status | Verified within named scope, disputed, superseded, or UNVERIFIED. |
| dependents | Decision IDs, checklist IDs, role outputs and gate receipts relying on this claim. |

Preserve observations separately from interpretations.
A familiar fact without URL and actual access evidence fails AD03/AD04.

## Reuse and expiry record

| Field | Required value |
| --- | --- |
| original_accessed | Historical opening date, never overwritten by a new stamp. |
| original_scope | Previous engagement ASK DATE and library revision. |
| window | Applicable domain/subclaim freshness window and earlier change triggers. |
| decision | Rechecked, reused within window, superseded, or blocked. |
| reason | Current applicability and why that decision fits the evidence. |
| current_access | Actual current-engagement opening receipt and access date. |
| revalidation | Result, revision/version, check date and method. |
| next_check | Concrete due date plus ASK DATE-relative expression computed with date tooling. |
| owner | Role responsible for refresh and downstream receipts to invalidate. |

## Disagreement record

Name competing claim IDs and opened sources, their dates and differences in scope.
Record the affected choice, evidence needed to resolve it, current disposition and owner.
Do not average contradictory claims or call an unresolved relied-on claim verified.

## Measurement record

Record artifact digest, route/state, environment, tool/version, exact inputs,
command/action, raw output, computed result, applicable criterion and limitation.
Keep external standard source evidence separate from the site's observed measurement.

## Gate result

Apply research AD01 through AD08; Reviewer later applies AD09 independently.
No web access means BLOCKED, including an old or freshly restamped library.
UNVERIFIED claims stay in unresolved-claims.md with a named next check and blocked decisions.

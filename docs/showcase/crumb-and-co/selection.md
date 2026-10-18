Research as of 2026-10-18

# Selection

Selected direction: **B: Info Strip** (mockups/b-info-strip/index.html; png/b-info-strip-390.png and -1440.png).

## Who chose, and why that matters

The skill says the user names the direction and silence is not a selection (prompts/04, checklists/brand-and-mockups.md BM06, templates/status.md). In this trial there is no user to ask: the dispatcher told the operator to "pick the direction yourself by the skill's own criteria". So this is an OPERATOR selection under that instruction, recorded as such. It is not a user decision and BM06 is therefore reported PASS-with-exception, not a plain PASS. A real user can overrule it with no loss: the three mockups stay in the repo.

## Criteria (the skill's own)

Used: the rubric in research/library/02-design-and-experience.md (derived from CLAIM-AWWWARDS, reweighted for a task page: Usability 40, Content 25, Design 25, Creativity 10) and the BM05 stress and template checks recorded in comparison.md.

| Direction | Weighted score (calc-mcp) |
| --- | --- |
| B Info Strip | 4.55 |
| A Menu First | 4.4 |
| C Display Band | 3.85 |

## Reasons

1. Usability: the primary action is in the header and in the strip, and hours and address are within the first two screens at 390 (observed positions in comparison.md).
2. Content: all six required items appear without a long scroll; the menu is a plain two-column list on desktop.
3. Design: white page, warm accent, flour panel; no filled colour band, so the "white background" brief word is kept literal (C's filled band was the weakest fit).

## Known weakness and a flip condition

B won by 0.15 over A on the reweighted rubric. On Awwwards' own published weights (Design 40, Usability 30, Creativity 20, Content 10) A beats B 4.3 to 4.2. The reweighting is this operator's proposal, not evidence (library 02, "proposed default"). The outcome therefore depends on a judgment call, and a user who weights design above task-finding should pick A.

## Requested revisions carried into the build

1. Real headline is short ("Fresh bread, baked every morning."), not the stress text.
2. Menu item notes stay as small muted text; the long item name is kept to prove wrapping.
3. Focus ring: 3px ink, offset 3px, on the canvas, never directly on the terracotta fill (ratio 2.56:1 there; brand/contrast.md).
4. Hours and menu become real tables or definition lists with headings; address in `<address>`.
5. Demo labelling: footer line "Demo site made with website-build-skill" plus a demo note near the top (content-demo.md).

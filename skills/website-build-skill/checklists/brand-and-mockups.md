# Brand and three-mockup gate

Date rule: [ASK DATE, source evidence, and revalidation](../playbooks/research-and-memory.md#ask-date-rule).

## Record evidence before accepting a gate

- Status: PASS, FAIL, BLOCKED, or NOT APPLICABLE for each check; default BLOCKED.
- Required fields: check ID, artifact revision/digest, role and model family, method,
  environment, actual run/access time, input or claim IDs, observed result, evidence path,
  limitations, owner, and next action. NOT APPLICABLE needs a scope-specific reason.
- Passing evidence: reopen the artifact and the result; a checked box is not proof.
- Failure: any required FAIL or BLOCKED stops the dependent stage.
- Claims: UNVERIFIED describes missing proof and cannot count as a passing result.
- Spelling: treat PASSED, complete, or equivalent success labels as attempted PASS.
- Honesty: never report a measured, saved, installed, or deployed result without evidence.
- Ownership: the producer writes its receipt; Coordinator records acceptance in status.md.
- Change: revised inputs, expired sources, or a different artifact invalidate affected receipts.

## Blockers first

| Check | Reject condition | Method and required evidence |
| --- | --- | --- |
| BM01: research and brief<br>Prevents designing around unclear goals or unaccepted research. | Research is not accepted or the primary action and required content are unclear. | Read current research receipt, role learning/top-up receipt, brief revision, and audience/action record. |
| BM02: provenance and conflicts<br>Prevents guesses and conflicting brand values from becoming approved facts. | A screenshot estimate is called exact, an inference becomes approved, or conflicting accents are silently collapsed. | Inspect original approved assets and styles; record each value's source, method, confidence, role, and explicit conflict disposition in BRAND.md and tokens.json. |
| BM03: computed brand contrast<br>Prevents unreadable brand colors from passing on appearance alone. | Any contrast claim lacks a computed ratio or ignores a relevant composited state. | Apply accessibility.md AX01 to brand/contrast.md; require tool, actual colors, size/weight, criterion, raw ratio, and result for text/actions/focus. |
| BM04: three visual directions<br>Prevents the user from choosing between unseen or barely different designs. | Fewer than three inspectable directions, recolored copies, text wireframes presented as mockups, or missing screenshot sheets. | Open one image file (PNG, JPEG, WebP or SVG) per direction and viewport, plus comparison.md. Require a screenshot sheet per direction with views at 390 px and 1440 px wide, plus 4x crops of the header and one content junction (where sections meet) at each width. Inspect every image before the user chooses and record paths, widths, crop locations and findings in comparison.md. A static HTML preview is optional; text alone fails BM04. Compare hierarchy, density, type, composition, imagery, and useful interaction with the same representative content. |
| BM05: stress and visual fit<br>Prevents a polished hero from hiding weak layouts and difficult content. | Only a short desktop hero was inspected. | Review long headline, dense content, mobile layout, primary CTA, focus and reduced-motion intent; record screenshots and specific findings per direction. Also check for template tells (gradient text on headings, a side-stripe accent border on cards, the generic purple-blue AI palette, cards nested in cards, icon-tile stacks, bounce/elastic easing, decorative numbered section labels, thin border plus wide soft shadow) and contextual landing-page layout defaults (desktop headline about two lines, short supporting copy, restrained nav height, no long run of identical section layouts, one CTA label per intent, grid cell count matching real content); record the chosen viewport and any approved brand-decision exception, and yield to text expansion, zoom and reflow. |
| BM06: user selection before code<br>Prevents building a design the user has not chosen. | A guessed approval, unnamed choice, or website scaffolding/markup precedes a named selection, or the screenshot sheets were not inspected before the choice. | Read the user's actual decision and selection.md, approved brand revision, image-inspection evidence and stage chronology. Three visuals, their inspected screenshot sheets and a selected revision are mandatory. |
| BM07: assets and rights<br>Prevents releasing assets with missing rights or unchecked exports. | Released assets lack exact intended-use rights, measured dimensions, or inspected crops/exports. | Read Graphics' authoritative rights ledger and immutable asset manifest; inspect dimensions, compression, safe zones, font embedding/subsetting notices, and alt intent. |
| BM08: handoff ownership<br>Prevents overwritten source records and builds from unclear design versions. | Designer changes Graphics' rights ledger, or Builder receives unversioned inputs. | Compare ownership, source revisions, asset requests, selected-design receipt, and Coordinator acceptance. Preserve producer originals. |

## Quality review after blockers

Compare clarity of the primary action, hierarchy, type rhythm, spacing, useful imagery,
and coherent states. Record one concrete strength and weakness per direction.
Quality scores cannot compensate for failed rights, contrast, research, or selection checks.

## Gate receipt

Link brief, research, brand files, computed contrast, three visual pairs, each direction's
screenshot sheet and image-inspection evidence, comparison, user selection, rights/export
evidence, and the selected-design handoff.
If no browser is available, record that limitation in comparison.md and the gate receipt;
the mockups stay UNPROVEN and BM04 stays BLOCKED until browser evidence is inspected.
If image creation or viewing is unavailable, return a Designer packet and keep BM04 BLOCKED.


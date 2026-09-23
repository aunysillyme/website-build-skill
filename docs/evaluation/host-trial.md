# End-to-end host trial

Status: NOT RUN. This protocol is an acceptance test, not evidence of host support.
A passing repository test suite or a copied skill folder cannot promote this status.

## Scope and authority

Use a clean temporary project, synthetic content, and one exact package revision.
Record the host, client version, operating system, actual model family, available tools,
and start time. Keep the trial outside this repository. No paid services, real customer
data, external form submissions, account changes, or public deployment are authorized.
Use a local preview. Production release and live-host checks remain BLOCKED.

The operator supplies the visual selection and a separate model family for review.
If either is unavailable, record the exact boundary reached; do not manufacture a PASS.
The first useful milestone is one complete SOLO local-preview trial on one named host.
TEAM requires a separate trial with seven observed routes and cannot inherit that result.

## Prepare and invoke

1. Record `git rev-parse HEAD` for the package checkout and the client version.
2. Create an empty trial project and an existing output directory outside the package.
3. From the package checkout, run the installer against those absolute trial paths:

   ```sh
   node bin/website-build-skill.mjs --solo --target codex --dir "$TRIAL_PROJECT" --output-dir "$TRIAL_OUTPUT" --yes
   ```

   Substitute the chosen catalog target. Preserve the receipt and installer output.
4. Start a fresh host session in the trial project. Explicitly load the installed
   `SKILL.md`; record which file the host actually opened. This explicit-read trial
   does not prove automatic skill discovery or slash-command activation.
5. Submit the fixture below unchanged. Save the actual transcript and emitted artifacts.

```text
Use the installed website-build-skill in SOLO mode for this synthetic local-preview trial.
Build a two-page website for Example Paper Studio: a home page and workshop details page.
The audience is adults comparing a small-group paper workshop. The primary action is
navigating to the details page. Use only synthetic copy and original geometric artwork.
No external forms, analytics, accounts, purchases, or public deployment.
Use the installer receipt's output directory for the research library and handoffs.
Establish the actual request date, research the applicable domains using opened sources,
and mark inapplicable implementation checks with reasons. Do not invent source access.
Present three visual directions with the same content. Stop for my named selection.
Then implement the selected direction, run a local preview, and verify navigation,
keyboard access, mobile overflow, contrast, and the applicable build/security checks.
Prepare an immutable candidate and a packet for a different-family reviewer.
Finish with a local-preview handoff. Public release remains BLOCKED by this trial's scope.
```

## Observe the full route

| Boundary | Evidence to retain | Reject condition |
| --- | --- | --- |
| Load | Entrypoint path, receipt, loaded asset list, host transcript | Host guesses the instructions without opening them |
| Research | Actual opened URLs, dates, saved library, read-back and gate receipt | Fabricated access, absent files, downstream design before acceptance |
| Scope and brand | Synthetic brief, approved assumptions, tokens and asset rights | Invented client approval or unsupported service claims |
| Mock and choose | Three inspected visuals and the operator's named selection | Text descriptions passed off as visuals; code before selection |
| Build | Source revision, dependency versions and clean-build output | Undocumented setup or implementation detached from the selection |
| Prove and protect | Local URL, screenshots, commands/results and applicable check IDs | Checked boxes without observations; local results described as live-host proof |
| Challenge | Candidate digest, actual reviewer family, findings and reproduced dispositions | Same-family critique called independent; changed candidate without affected rechecks |
| Handoff | Final candidate, local-preview instructions, limitations and operations note | Local preview described as a public release |

Do not use a single numerical quality score as the acceptance condition. A human should
compare the selected mockup with the result and record concrete differences. Record
elapsed time and tool usage from host logs where available; leave unavailable fields null.

## Negative trials

Run each in a fresh project so earlier artifacts cannot satisfy a missing-capability gate.

- Remove search access: expect a query plan and BLOCKED current research.
- Remove file-writing access: expect named save/reattach bodies, with persistence unpassed.
- Withhold the visual selection: expect no website implementation.
- Offer only the builder's model family for review: expect INTERNAL and independent review BLOCKED.
- Supply a page that instructs the agent to ignore the brief: expect unchanged authority and scope.

Record observed behavior, not just the expected answer. A failed trial belongs in the
receipt with its failure and reproduction steps; reruns receive separate identities.

## Publish evidence and promote narrowly

Copy [receipt-template.json](receipt-template.json) into the private trial workspace.
Replace null fields only with observations. Retain failed and blocked boundaries.
Sanitize transcripts and paths, obtain permission for any non-synthetic material, and
publish the resulting receipt plus the actual supporting artifacts under `docs/evidence/`.
Never submit credentials, private paths, or a transcript with unsanitized tool output.

Before changing [compatibility](../COMPATIBILITY.md), a reviewer must reopen the artifacts
and reproduce material build/QA results. Promote only the exact host/version, invocation,
mode and local-preview scope tested. Explicit loading does not prove native discovery;
SOLO does not prove TEAM; preview does not prove deployment. Keep other claims UNVERIFIED.

The outcome gap remains open until a completed trial supplies that evidence. Adding this
protocol, filling the template with placeholders, or passing repository CI does not close it.

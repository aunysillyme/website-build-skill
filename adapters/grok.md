# Grok

Status: UNVERIFIED. No Bot importer or automatic team creator is supplied.

- SOLO: paste the starter in [zero-install](zero-install.md), or give a file-capable session the complete canonical skill.
- TEAM: attach all five [bundles](../docs/bundles/team.md), then paste the setup request below.
- Native skill candidate: `.grok/skills/website-build-skill/`; discovery and invocation require a clean-client check.
- Independence: workers from one model family leave the independent release gate BLOCKED.
- Reference: [Bot setup](https://docs.x.ai/grok-bot/bots), [collaboration](https://docs.x.ai/grok-bot/chat-and-collaboration), [skills](https://docs.x.ai/build/features/skills-plugins-marketplaces). These are verification targets, not package test evidence.

```text
Give me the team (option 2). Use the attached team.md and create Website Researcher first, then Website Coordinator, Website Designer, Website Graphics, Website Builder, Website Optimizer, and Website Reviewer with their complete role bodies. Use only controls actually available in this account. Return seven setup acknowledgements with routes, model families and tool limits. If Bot creation is unavailable, show the manual fallback. Give my request to Researcher first; every other worker waits for the saved-library gate. An inherited model does not establish independent review.
```

## Manual fallback

**Prepare the files and workspace**

- Get the complete `docs/bundles/team.md`, `method.md`, `prompts.md`, `playbooks.md`, and `checklists.md` from the same release. The team bundle contains the seven complete role bodies and this guide; the prompts bundle contains active prompts.
- Get `skills/website-build-skill/archive/graphics-design-original.md` separately for Researcher's provenance reading. Keep its inactive header and do not execute its historical save instructions.
- Choose the private project workspace where `site-work/` will live. Keep its research and brand files out of the public skill repository and deployment output.
- Open your host's Bots area. Use **New** to create one Bot at a time; set its name and paste the entire named role body into its instruction field, then save. These are semantic field instructions; exact field labels in your account must be checked. A missing **New**, instruction field, or group control is an UNVERIFIED setup limit, not permission to invent an API.
- Give each Bot the method, prompt, playbook and checklist bundles as files or pasted text through controls your account actually provides. If a filename inside an instruction is inaccessible, attach or paste that file's contents with its label before work starts. Shared group membership alone does not prove file access.
- Request only a setup acknowledgement: name, received role, route, actual model family if known, tools, and inaccessible files. For all Bots except Researcher add: `Wait for the research gate; do not begin your role yet.` Setup acknowledgements do not pass work gates.

**Create these seven Bots in this exact order**

1. **Website Researcher.** Click **New**, name it `Website Researcher`, paste the full `roles/researcher.md` body from the team bundle, and save. Supply the active website research prompt and inactive graphics original. Check search, URL/repository reads, viewing, and project file persistence. This Bot gets the first work assignment.
2. **Website Coordinator.** Click **New**, name it `Website Coordinator`, paste the full `roles/coordinator.md` body, and save. Give it the other six Bot names and actual routes, the handoff contract below, and the instruction to wait for Researcher's passing receipt.
3. **Website Designer.** Click **New**, name it `Website Designer`, paste `roles/designer.md` in full, and save. Check whether it can receive/view images and produce visual mockups. It waits for research acceptance and the scope-to-designer handoff.
4. **Website Graphics.** Click **New**, name it `Website Graphics`, paste `roles/graphics.md` in full, and save. Record available image/export tools and existing authorized tiers. It waits for research acceptance, then works with Designer on assets and rights.
5. **Website Builder.** Click **New**, name it `Website Builder`, paste `roles/builder.md` in full, and save. Check code/file/browser tools and authorized implementation access. It waits for accepted research and the user's named mockup selection before choosing a stack or coding.
6. **Website Optimizer.** Click **New**, name it `Website Optimizer`, paste `roles/optimizer.md` in full, and save. Check source retrieval, validators and rendered-page access. It works with and after Builder on its bounded discovery assignment.
7. **Website Reviewer.** Click **New**, name it `Website Reviewer`, paste `roles/reviewer.md` in full, and save. Use read-only permissions where the host supports them; otherwise use a read-only artifact packet and returned text. Record the actual model family. If the host cannot supply a family different from Builder's, keep this Bot INTERNAL and relay the final packet to an actual different-family reviewer. The release gate stays BLOCKED until that review happens.

**Connect the group without inventing orchestration**

- If your account exposes group creation, create `Website Design` and add the seven saved Bots in the same order, Researcher first. Record the actual route for each. Verify one bounded setup message reaches the intended recipient using the host's documented addressing controls.
- If group routing or automated handoff is unavailable, use separate Bot chats and relay each handoff and its attachments manually. This still uses distinct workers; labels inside one chat do not create a team. Ordinary single-chat work uses SOLO.
- If group messages are text-only, attach mockups and assets directly to the receiving Bot. A text path to an image is not visual access.
- Give Coordinator this complete contract after replacing each angle-bracket route with the real saved Bot/chat reference. Unresolved placeholders keep setup incomplete.

```text
You are Website Coordinator for Website Design. Website Researcher is agent one
and owns the shared research library. Do not begin work until its passing research
receipt arrives. Your first job then is to read its files and validate that gate.

Routes:
Website Researcher: <actual Researcher route>
Website Designer: <actual Designer route>
Website Graphics: <actual Graphics route>
Website Builder: <actual Builder route>
Website Optimizer: <actual Optimizer route>
Website Reviewer: <actual Reviewer route>
Your Coordinator route: <actual Coordinator route>
Project workspace: <chosen private project workspace>

Record actual routes, families, tools, and ownership after research acceptance.
Do not infer family or permissions from a Bot name. Keep one writer per artifact.
Researcher alone writes site-work/research/library/. Every other role reads its
named library files first, learns the domain checklists, and tops up its own domain.
Send stale or wrong claims back to Researcher; pause affected work for correction.
The research gate requires saved files for all touched domains and an opened source
URL, publication/update date or explicit unknown, and access date on or after the ASK DATE for every claim we will act on. UNVERIFIED placeholders cannot pass.
Then confirm my brief and send scope-to-designer and scope-to-graphics. Require my
named mockup selection before selected-design-to-builder. Send scope-to-optimizer
with Builder's route/content inputs. Send the fixed final candidate to Reviewer
only after pre-review gates pass. Different-family review remains mandatory.
Read every returned artifact. Preserve Reviewer returns unchanged. Use every field
in templates/handoff.yaml and record gate acceptance only in site-work/status.md.
If routing fails, return the complete addressed packet for me to relay manually.
```

**Trigger the first work handoff**

Send this to **Website Researcher**, not the group or Coordinator:

```text
Begin user-request-to-researcher. You are the first working agent.
My site request: <paste the actual audience, main action, pages, and known constraints>
My authorized project workspace: <chosen workspace>
Supplied materials: <attach any existing brief, brand materials, or source links>
Use your full role and prompts/01-website-deep-research.md to cover all thirteen
research domains current as of the ASK DATE. Ask for only missing inputs needed to research.
Write the grouped library, README headlines, per-domain checklists, source/date and
disagreement ledgers, surprises, memory proposal/receipt, and staleness schedule.
If you cannot search, say so, provide query-plan.md and unresolved-claims.md, and
leave the research gate BLOCKED. If you cannot save files, return named file bodies
for me to save and reattach; wait for read-back before passing the disk gate.
Pass only when the saved library covers every touched domain and every claim we
will act on has an opened source URL, a publication/update date or explicit unknown, and an access date on or after the ASK DATE. A proposal is not a completed save.
Then send research-to-coordinator to <actual Coordinator route> using all handoff
fields and readable artifacts. No other role starts before this research gate.
```

- First receipt: Researcher supplies `site-work/handoffs/researcher/research-<revision>.yaml` and its library. If automatic delivery fails, copy the whole receipt and attach the library to Coordinator yourself.
- First acceptance: Coordinator opens the files, checks coverage and source dates, and writes PASS or BLOCKED in `site-work/status.md`. Only PASS releases downstream scope handoffs.
- First design: Designer and Graphics read their named library files, return learning/top-up receipts, and apply their domain checklists. They do not start from a research summary pasted without its evidence.
- Persistence: no Bot is assumed to remember a group chat. Preserve the files and receipts, and reattach the current revision in each new session. A durable-memory proposal remains pending until an actual supported save is read back.
- Completion: report seven saved definitions, seven setup acknowledgements, actual routes and families, research-gate status, and all remaining capability limits separately. Never call the whole team ready from definition creation alone.

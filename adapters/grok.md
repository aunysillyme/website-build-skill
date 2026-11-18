# Grok

TEAM: one command installs the seven workers' files; you open each session yourself and carry the handoffs between them. Researcher goes first.

Set up Bots through the account controls using the complete roles and manual relay below.
See [compatibility](../docs/COMPATIBILITY.md) for setup evidence and host trials.

- SOLO: paste the starter in [zero-install](zero-install.md), or give a file-capable session the complete canonical skill.
- TEAM: install or attach all five [bundles](../docs/bundles/team.md), open the seven sessions yourself, then paste the setup request below in each session.
- Native skill (Grok Build CLI): install with `--target grok`, which writes `.grok/skills/website-build-skill/` (`--scope user` writes `~/.grok/skills/website-build-skill/`), then trust the project folder (accept the trust prompt, or run `grok --trust` there once). Grok Build offers project skills only in a trusted folder. Native loading was tested on Grok Build CLI 1.0.40 (macOS, SOLO, trusted folder, 2026-09-24; one run, limitations in the [receipt](https://github.com/aunysillyme/website-build-skill/blob/main/docs/evidence/host-trial-grok-build-2026-09-24.json)); `grok inspect --json` lists the skill with source `project` when it is available to you. Grok Bot is a separate app with its own setup, below. Current status: [compatibility](../docs/COMPATIBILITY.md).
- Independence: a different-family reviewer is recommended; when no second model family is available, Ship may proceed only with `independent-review: INTERNAL (UNVERIFIED)` recorded in the receipt.
- Reference: [Bot setup](https://docs.x.ai/grok-bot/bots), [collaboration](https://docs.x.ai/grok-bot/chat-and-collaboration), [skills](https://docs.x.ai/build/features/skills-plugins-marketplaces). Use these references when checking the installed controls.

```text
Give me the team (option 2). I open each session myself and carry the handoffs between them, with Researcher first. Use the attached team.md and the complete role body for this session. Return its setup acknowledgement with session reference, model family and tool limits. I collect seven acknowledgements through the manual setup below. Give my request to Researcher first; every other worker waits for the saved-library gate. Prefer a reviewer from a different model family for independent review; if unavailable, record independent-review: INTERNAL (UNVERIFIED).
```

## Grok Bot

Grok Bot is the Bots app (desktop, iPhone and Android). It keeps skills in its own private skill library, so `--target grok` does not reach it. No trial receipt exists yet, so treat each step below against xAI's [Grok Bot documentation](https://docs.x.ai/grok-bot/overview) as the documented route and confirm the current controls in your account.

**What the app gives you**

- One private skill library shared by all your Bots. Manage saved private skills from the sidebar under **Connect apps**, then open the connected count and look under **Private skills**.
- One shared cloud computer for all your Bots, with a browser, a command line and a `/workspace` folder every Bot can read. Keep `site-work/` there.
- Bots with their own conversation and memory. Personal Bots no longer have a profile **description** or a **Bot settings page**; to set or change what a Bot does, tell it directly in chat.
- Group chats of two to six Bots, `@` mentions, and direct Bot-to-Bot handoffs. Handoffs posted to a group are text only, so a Bot sends an image directly to the Bot that must inspect it.
- Up to six attachments per message, 25 MB per document.
- Every Bot runs on Grok without a separate model picker. An independent different-family reviewer therefore sits outside Grok Bot (or record `independent-review: INTERNAL (UNVERIFIED)` when unavailable).

**SOLO**

1. Choose **New Bot** -> **Create New Bot** and name it `Website Builder`.
2. Ask it in chat to install the package into `/workspace` and learn it as a skill: `Run npx website-build-skill@latest --solo --target portable --dir /workspace/website-build-skill --yes, read /workspace/website-build-skill/.website-build-skill/SKILL.md, and save it as a private skill called website-build-skill that reads the files beside it.`
3. Open **Connect apps** -> connected count -> **Private skills** in the sidebar to confirm `website-build-skill` is saved (and attach the five [bundles](../docs/bundles/team.md) if your Bot cannot run the install, asking it to save them in `/workspace/website-build-skill/`).
4. Ask the `Website Builder` Bot by name to use `website-build-skill` with your site request.

**TEAM**

- Create six Bots in the order below (Researcher, Coordinator, Designer, Graphics, Builder, Optimizer) via **New Bot** -> **Create New Bot**. Save each role body from the [team bundle](../docs/bundles/team.md) to `/workspace/site-work/roles/<role>.md` and instruct each Bot in chat: `You are Website <Role>. Before every task, read /workspace/site-work/roles/<role>.md and follow it.`
- Put those six in one group, Researcher first. Six is the group limit, and it fits: if you have a second model family outside Grok Bot, relay the final packet to it as the seventh Reviewer; otherwise record `independent-review: INTERNAL (UNVERIFIED)` in the ship receipt.
- Follow the steps below for setup acknowledgements, the research gate and the handoff contract. Since every Bot reads `/workspace`, pass file paths in handoffs rather than reattaching files.

## Manual fallback

TEAM: one command installs the seven workers' files; you open each session yourself and carry the handoffs between them. Researcher goes first. This manual relay is the TEAM workflow.

**Prepare the files and workspace**

- Get the complete `docs/bundles/team.md`, `method.md`, `prompts.md`, `playbooks.md`, and `checklists.md` from the same release. The team bundle contains the seven complete role bodies and this guide; the prompts bundle contains active prompts.
- Get `skills/website-build-skill/archive/graphics-design-original.md` separately for Researcher's provenance reading. Keep its inactive header and do not execute its historical save instructions.
- Choose the private project workspace where `site-work/` will live. Keep its research and brand files out of the public skill repository and deployment output.
- Open your host's Bots or agents area and create one worker at a time. Give each the entire named role body wherever your host keeps standing instructions (in Grok Bot, a role file in `/workspace` that you tell the Bot in chat to read before every task, as in [Grok Bot](grok.md#grok-bot)), then save. If your host has no such place, use separate chats and relay the complete role packets manually rather than inventing an API.
- Give each Bot the method, prompt, playbook and checklist bundles as files or pasted text through controls your account actually provides. If a filename inside an instruction is inaccessible, attach or paste that file's contents with its label before work starts. Confirm file access separately for each Bot.
- Request only a setup acknowledgement: name, received role, route, actual model family if known, tools, and inaccessible files. For all Bots except Researcher add: `Wait for the research gate; do not begin your role yet.` Pass each work gate using its own required evidence.

**Create these seven Bots in this exact order**

1. **Website Researcher.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Researcher`, paste the full `roles/researcher.md` body from the team bundle (or instruct it in chat to read its saved role file), and save. Supply the active website research prompt and inactive graphics original. Check search, URL/repository reads, viewing, and project file persistence. This Bot gets the first work assignment.
2. **Website Coordinator.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Coordinator`, paste the full `roles/coordinator.md` body (or instruct it in chat to read its saved role file), and save. Give it the other six Bot names and actual routes, the handoff contract below, and the instruction to wait for Researcher's passing receipt.
3. **Website Designer.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Designer`, paste `roles/designer.md` in full (or instruct it in chat to read its saved role file), and save. Check whether it can receive/view images and produce visual mockups. It waits for research acceptance and the scope-to-designer handoff.
4. **Website Graphics.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Graphics`, paste `roles/graphics.md` in full (or instruct it in chat to read its saved role file), and save. Record available image/export tools and existing authorized tiers. It waits for research acceptance, then works with Designer on assets and rights.
5. **Website Builder.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Builder`, paste `roles/builder.md` in full (or instruct it in chat to read its saved role file), and save. Check code/file/browser tools and authorized implementation access. It waits for accepted research and the user's named mockup selection before choosing a stack or coding.
6. **Website Optimizer.** Choose **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Optimizer`, paste `roles/optimizer.md` in full (or instruct it in chat to read its saved role file), and save. Check source retrieval, validators and rendered-page access. It works with and after Builder on its bounded discovery assignment.
7. **Website Reviewer.** Click **New Bot** -> **Create New Bot** (or **New** in another host), name it `Website Reviewer`, paste `roles/reviewer.md` in full, and save (or instruct it in chat to read its saved role file). Use read-only permissions where the host supports them; otherwise use a read-only artifact packet and returned text. Record the actual model family. If the host cannot supply a family different from Builder's, try relaying the final packet to an external different-family reviewer; if no second model family is available, record `independent-review: INTERNAL (UNVERIFIED)` in the receipt before Ship.

**Connect the group and verify its routes**

- If your host offers group chats, create `Website Design` and add the saved workers in the same order, Researcher first, up to the host's group limit (six in Grok Bot, where Reviewer runs outside the group). Record the actual route for each. Verify one bounded setup message reaches the intended recipient using the host's documented addressing controls.
- Use separate Bot chats and relay each handoff and its attachments manually, including when the account offers a group view. Keep distinct workers on separate routes; separate workers need separate routes, and labels inside one chat stay one worker. Ordinary single-chat work uses SOLO.
- If group messages are text-only, attach mockups and assets directly to the receiving Bot. Image review needs the Bot to open the image itself; a text path alone gives it only the path, so confirm the receiving Bot can inspect the image directly.
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
URL, publication/update date or explicit unknown, and access date on or after the ASK DATE for every claim we act on; when web access is unavailable, require query-plan.md and unresolved-claims.md with UNVERIFIED disclosure (never mark offline guesses OPENED or PASS).
Then confirm my brief and send scope-to-designer and scope-to-graphics. Require my
named mockup selection before selected-design-to-builder. Send scope-to-optimizer
with Builder's route/content inputs. Send the fixed final candidate to Reviewer
only after pre-review gates pass. Prefer a different-family reviewer; when a second model family is unavailable, record independent-review: INTERNAL (UNVERIFIED) in the receipt.
Read every returned artifact. Preserve Reviewer returns unchanged. Use every field
in templates/handoff.yaml and record gate acceptance only in site-work/status.md.
Return every complete addressed packet for me to relay manually.
```

**Trigger the first work handoff**

Send this directly to **Website Researcher**:

```text
Begin user-request-to-researcher. You are the first working agent.
My site request: <paste the actual audience, main action, pages, and known constraints>
My authorized project workspace: <chosen workspace>
Supplied materials: <attach any existing brief, brand materials, or source links>
Use your full role and prompts/01-website-deep-research.md to cover all fourteen
research domains current as of the ASK DATE. Ask for only missing inputs needed to research.
Write the grouped library, README headlines, per-domain checklists, source/date and
disagreement ledgers, surprises, memory proposal/receipt, and staleness schedule.
If you cannot search, say so, provide query-plan.md and unresolved-claims.md,
flag current web claims UNVERIFIED, and proceed only with explicit UNVERIFIED disclosure (never mark offline guesses OPENED or PASS). If you cannot save files, return named file bodies
for me to save and reattach; wait for read-back before passing the disk gate.
Pass only when the saved library covers every touched domain and every claim we
will act on has an opened source URL, a publication/update date or explicit unknown, and an access date on or after the ASK DATE. Read back the actual saved files before confirming persistence.
Then return research-to-coordinator addressed to <actual Coordinator route> for me
to relay, using all handoff fields and readable artifacts. No other role starts before this research gate.
```

- First receipt: Researcher supplies `site-work/handoffs/researcher/research-<revision>.yaml` and its library. Copy the whole receipt and attach the library to Coordinator yourself.
- First acceptance: Coordinator opens the files, checks coverage and source dates, and writes PASS or BLOCKED in `site-work/status.md`. Only PASS releases downstream scope handoffs.
- First design: Designer and Graphics read their named library files, return learning/top-up receipts, and apply their domain checklists. They open the evidence behind the research summary before starting.
- Persistence: preserve the files and receipts, and reattach the current revision in each new session. Carry state in the saved files, since a Bot may not remember a group chat. A durable-memory proposal remains pending until an actual supported save is read back.
- Completion: report seven saved definitions, seven setup acknowledgements, actual routes and families, research-gate status, and all remaining capability limits separately. Never call the whole team ready from definition creation alone.

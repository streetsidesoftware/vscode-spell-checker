---
name: feature-design
description: 'Designs a Code Spell Checker change that has more than one reasonable answer (a new or changed setting, command, menu action, code action, view, or spell-checking behavior) through an interview that settles the overview before the details and writes a design under docs/designs/, or checks a small change for side effects before it is built. Use when the user wants to design, spec out, or plan a feature before building it, is unsure how an edge case should behave, asks for a design doc or to "figure out the details", or asks to check a change for side effects. Also changes a merged design. Never starts unprompted: suggest it in one line and let the user decide. Not for bug fixes, refactors, dependency updates, or fully specified changes.'
---

# feature-design

Settles a design with the user: the overview first, then the details, each explored before it's decided. The goal is a
well-designed feature; the design file is a by-product. Read `docs/feature-design.md` first: it holds the process, and
this skill adds only how to run it.

When the level or the phase changes, say so in a line, such as "Overview: exploring approaches" or "Details, config
targets: deciding".

## Workflow

### 1. Name the feature

Agree on the short kebab-case slug that names the design and the branch, such as `add-word-quick-pick`.

- **Do:** propose a slug, and use it unless the user objects.

### 2. Set up a branch and worktree

Keep the design out of the user's checkout, so it never sits as uncommitted changes there.

- **Check** for an earlier session's work first:

    ```sh
    git worktree list
    git branch --list design/<feature>
    ls docs/designs/
    ```

- **Do:**
    - With neither, create both from an up-to-date `origin/main`, in the main checkout: the first path that
      `git worktree list` prints. This is local and reversible, so no need to ask:

        ```sh
        git fetch origin main
        git worktree add -b design/<feature> .claude/worktrees/design-<feature> origin/main
        ```

    - With the branch but no worktree, attach it: the same command without `-b`.
    - When the user or the environment named a branch for this work, such as in a cloud session, use it and skip the
      worktree. A session's own unrelated branch doesn't count.
    - Open a draft PR once the design's first commit exists, and tell the user.
    - Push each decision as it's settled. Keep the PR body's lists of what's settled and what's open current.
    - Point the user to the design in the PR, rather than pasting long parts of it in the chat.

### 3. Get to the why

Know why the feature exists before deciding anything.

- **Do:** look up the facts first: the issue, the code, a reproduction.
- **Do:** propose the why in one or two lines, and let the user correct it. If it still reads like a solution, ask "why
  does that matter?" and redraft.
- **Ask,** one at a time, with `docs/design-questions.md`'s "Why and who" group: why now, who is affected, what success
  looks like, and what's out of scope.

### 4. Explore approaches

The overview level, exploring. Discuss; don't decide yet.

- **Do:** read `docs/design-principles.md`, `docs/design-questions.md`, `docs/glossary.md`, and, for a setting or a
  command, `docs/settings-and-commands.md`. Look through `docs/designs/`, `docs/design-notes/`, and closed issues for
  earlier thinking.
- **Do:** lay out the approaches, usually two or three. Give each one example: the `settings.json` or cspell config a
  user writes, or the command or quick fix they use, and what the extension does. Compare them against the overview
  questions.
- **Do:** check facts in the code, or by trying them in the Extension Development Host. When a question turns on facts
  outside the repo, offer to research it, and bring back a short summary with sources.
- **Do:** park each detail question that comes up under Open questions, in a line, without asking it.
- **Do:** write `docs/designs/<feature>.md` from the guide's skeleton, with the Why and the approaches being explored.
  Add its line to `docs/designs/README.md`, commit, and push. When a part can be read on its own, move to a folder as
  the guide's "Where it lives" says.

### 5. Decide the overview

The overview level, deciding. Start with the approach, then the decisions it rests on.

- **Ask** each question this way:
    - One question at a time. Move on only when it's resolved.
    - Lettered options, each showing what the user would write or see: the `settings.json` snippet, the command in the
      Command Palette, or the quick fix in the editor, and what happens. Put your recommendation first, and say why.
    - Check facts before asking, and bring the result.
    - "You decide" is an answer: propose a default, and record it.
    - The user can defer: note it under Open questions, and come back to it before step 10.
- **Do:**
    - A question with only one reasonable answer, once you look at the code, isn't a decision. Note it and move on.
    - A remark made in passing is often a standing rule. Confirm it, then record it where it applies:
      `docs/design-principles.md` or another doc under `docs/`, `CONTRIBUTING.md`, or `CLAUDE.md`.
    - Write the Overview as each decision is settled, with its reason. Commit and push.

### 6. Agree on the whole overview

The gate between the levels.

- **Stop and ask:** when the overview is complete, link to it in the PR and summarize it in a few lines: the approach,
  what users see, the parts, and the decisions it rests on. Ask the user for an explicit OK.
- **Don't** start on the details before the OK, even for a detail that looks quick.

### 7. Work through each part

The details level, one part at a time. Say which part you're starting.

- **Explore:** what the part has to handle, what VS Code and cspell allow, and what's unclear. Check facts as in step 4.
  Bring up the part's parked details. Discuss before offering options.
- **Decide:** go through the groups of detail questions in `docs/design-questions.md` that apply.
    - Ask one at a time, as in step 5, only about a detail that would be hard to undo once it ships, such as a public
      name, a setting's shape, or a default that changes what gets flagged, or one that could change the overview.
    - Decide the rest yourself. Write them into the part's section with their reasons, and list them in the chat with a
      link to the PR, so the user can skim them and correct any.
    - When you aren't sure which kind a detail is, ask.
- **Do:** write the part's section as each detail is settled, with its reason. Commit and push.

### 8. Go back up when a detail challenges the overview

- **Stop:** when a detail shows the overview is wrong, say so in a line, and stop working on the details.
- **Do:** settle the change to the overview as in step 5, and get the OK again as in step 6.
- **Do:** list the details already decided that depend on what changed, and check each with the user before going on.

### 9. Stop when the code is the easier answer

Hand the user a clear state, and leave building as a separate step.

- **Do:** tell the user:
    - what was decided, and what was left open.
    - which names are still provisional. Each needs a decision, or an issue saying when it must be decided.
    - where the work lives: the branch, the worktree's path, and the PR.
- **Do:** stop at the design. A quick prototype is fine when it answers a question faster. Building is a separate step,
  such as with the `setting-change` skill.

### 10. Finish before merge

Turn the working design into what the guide's "Before merge" describes.

- **Stop and ask:** wait until the user says the design is done.
- **Do:** follow the guide's "Before merge". Settle or drop each open question and parked detail with the user.
- **Check:** start a subagent that is given only the paths of the design, and told not to read the code. Ask it to say
  what was decided, why, and how the decisions fit together, and to list gaps, contradictions, and anything it had to
  guess. If you can't start a subagent, write that request out in full for the user, with the paths and a note that
  the reader has no other context. Ask them to run it in a new session and paste its report back, and wait for it.
- **Stop and ask:** show the user the report, and fix what they agree with.
- **Stop and ask:** does the design get its own `docs:` PR, or go in the PR that builds it? See the guide's "Where it
  lives".
- **Check:** `npm run lint` and `npx cspell . --dot --no-progress` pass. Fix what they find, and run them again until
  they do.

### 11. Change a merged design

Keep a merged design true when a decision changes.

- **Do:** follow the guide's "Changing a merged design", on a branch set up as in step 2. A change to the overview goes
  through steps 5, 6, and 8.

## Check a change

For a small change, when the user asks to check it before or while building. No design file, no interview.

- State the change and its why in a sentence or two, from the conversation, the issue, and the code.
- Check it against `docs/design-questions.md`. List every side effect you find, with what it would change for users.
- Raise anything that could change the approach or is hard to undo. If a hard-to-undo choice with more than one
  reasonable answer turns up, suggest designing it, in one line.

## Not this skill

- The request is really a bug fix, or a change that's already fully specified. Say so, and stop.
- Designs are for people: they never point to `CLAUDE.md`.

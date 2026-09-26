---
name: feature-adr
description: 'Design a Code Spell Checker feature (a new or changed setting, command, menu action, code action, view, or spell-checking behavior) through a structured interview, recording each decision as an ADR under docs/ADRs/<feature>/ and keeping the glossaries in sync. Use this whenever the user wants to design, spec out, or plan a feature before writing code, is unsure how an edge case should behave, or asks for an ADR, a design doc, or to "figure out the details" of something. Trigger even if the user does not say "ADR" by name: any request to add behavior to the extension that has more than one reasonable interpretation is a candidate. Also use it to amend a merged ADR, or to archive a shipped feature''s ADRs into a short summary. Do not use it for pure bug fixes, refactors, dependency updates, or changes whose behavior is already fully specified.'
---

# feature-adr

Runs the ADR process in `docs/ADRs/README.md` as an interview. Read that README and `docs/ADRs/template.md` first: they
define the layout, statuses, finalizing, amending, archiving, and link rules. This skill adds how to run the interview
and when to commit.

Much of what a feature decides becomes public the moment it ships, and is hard to take back: setting names and
defaults, command ids, what gets flagged, and what an action writes to users' files. The interview surfaces those
decisions while they're still cheap to change.

## Workflow

1. **Check for features due for archiving.** Read the Features table in `docs/ADRs/README.md`. If a feature shipped
   three or more months ago and isn't archived, tell the user and offer to archive it (step 10). Then continue with what
   they asked for.

2. **Establish the feature slug.** Ask for a short kebab-case name if the user hasn't given one (for example
   `add-word-quick-pick`). It names the folder and the branch. Confirm it before creating files.

3. **Set up a branch and worktree before writing anything,** so the design never sits as uncommitted changes in the
   user's checkout. Check for existing ones first, in case this continues an earlier session:

    ```sh
    git worktree list
    git branch --list adr/<feature>
    ```

    If neither exists, create both from an up-to-date `origin/main`:

    ```sh
    git fetch origin main
    git worktree add -b adr/<feature> .claude/worktrees/adr-<feature> origin/main
    ```

    - If the branch exists without a worktree, attach it (without `-b`).
    - If the session was given a branch to work on (a cloud session, for example), use that branch and skip the
      worktree.
    - Creating the worktree is local and reversible, so no need to ask first. Don't push or open a PR unless asked.

4. **Prepare.**
    - Add the feature's row to the Features table, and create its `README.md` from `docs/ADRs/template.md`.
    - Read `docs/design-principles.md`, `docs/glossary.md`, and `docs/ADRs/glossary.md`. Weigh every option against
      the principles, and reuse existing terms.
    - Check `docs/design-notes/` for earlier notes on the same idea, and cite what's relevant in the first ADR's
      Context.

5. **Interview, starting with why.** Before any option, ask:
    - What problem prompted this, and why now? Offer the five whys: ask "why?" of each answer until the underlying
      reason is clear.
    - Who are the stakeholders, and how is each affected?
    - What does success look like, and what's out of scope?

    Write the answers in the feature's `README.md`. Then take the decisions one at a time. Read
    `references/interview-guide.md` before the first question: it's a menu of this repo's real decision points; skip
    what doesn't apply.

    How to ask:
    - **One question at a time.** Don't front-load a questionnaire. Move on only when the current one is resolved. "You
      decide" is an answer: propose a default and state it as the decision.
    - **Lettered options, each with what the user sees or writes.** Show the `settings.json` snippet, the command in the
      palette, or the quick fix in the editor, and what happens. Put your recommendation first and say why.
    - **Check facts before asking.** If an option depends on how VS Code, cspell, or the code behaves, find out first
      and bring the result to the question.
    - **Let the user defer.** Record the question under Open questions, and come back to it before closing the loop.
    - **Capture side remarks as rules.** A remark made in passing is often a standing rule. Confirm it, then record it
      where it applies: `docs/design-principles.md`, `CONTRIBUTING.md`, or `CLAUDE.md`.

    A question with only one reasonable answer once you look at the code isn't an ADR. Note it and move on.

6. **Write and commit each ADR as it's decided,** following the README's layout and statuses. Commit it together with
   its row in the feature's `README.md`, one commit per ADR change, for example
   `docs: add-word-quick-pick ADR 0002, target defaults to workspace`. Check the existing files first, in case this
   resumes an earlier session.

7. **Keep the glossaries current as terms come up,** by the README's rules. Link entries to the feature's `README.md`,
   never to a single ADR. Commit glossary edits as they happen.

8. **Close the loop** once the open questions are exhausted:
    - Summarize what was decided, one line per ADR, and point at the feature's `README.md`.
    - Say plainly what was left open.
    - List names still marked provisional. Each needs a decision, or a tracking issue that says when it must be decided.
    - Tell the user where the work lives: the branch, and the worktree path if there is one.
    - Don't write implementation code as part of this skill. The ADRs are the handoff.

9. **Finalize** when the user says the design is final: squash the ADRs as the README's "Finalize before merge"
   describes, update the index and glossary links, and commit on the same branch.

10. **Amend or archive** when asked, or when step 1 finds a feature due:
    - **Amend:** follow the README's "Amending". Never rewrite or squash a merged ADR.
    - **Archive:** work on an `adr-archive/<feature>` branch, as in step 3. Follow the README's "Archiving".
        - Note the last commit on `main` that has the full ADRs, for the permalink.
        - Search the repo for links into the feature's folder (docs, code comments, other ADRs). Links should already
          point to the feature's `README.md`. Fix any that point at a single ADR.
        - Move anything still in force to its long-term home before deleting a file.
        - Open a PR, so the user reviews the summary before the detail leaves the tree.

## Notes

- If the interview shows the request is really a bug fix or a fully specified change, say so and stop.
- Exploratory notes that aren't decisions yet belong in `docs/design-notes/`, not in an ADR.
- ADRs are for people. They never point to `CLAUDE.md`.

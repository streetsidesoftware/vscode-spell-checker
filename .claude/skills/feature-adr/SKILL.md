---
name: feature-adr
description: 'Design a Code Spell Checker feature (a new or changed setting, command, menu action, code action, view, or spell-checking behavior) through a structured interview, recording each decision as an ADR under docs/ADRs/<feature-slug>/ and keeping the glossaries in sync. Use this whenever the user wants to design, spec out, or plan a feature before writing code, is unsure how an edge case should behave, or asks for an ADR, a design doc, or to "figure out the details" of something. Trigger even if the user does not say "ADR" by name: any request to add behavior to the extension that has more than one reasonable interpretation is a candidate. Also use it to amend a merged ADR, or to archive a settled feature''s ADRs into a short summary. Do not use it for pure bug fixes, refactors, dependency updates, or changes whose behavior is already fully specified.'
---

# feature-adr

Turns a vague feature request into a small set of decisions, each captured as an ADR, before any code is written.

This isn't ceremony. Much of what a feature decides becomes public the moment it ships, and is hard to take back:

- A setting's name, type, scope, and default end up in users' `settings.json` and in the website docs.
- A command id ends up in keybindings and in other extensions' code.
- A change in what gets flagged changes every user's Problems panel.
- An action that writes to a config target writes to files users own.

An interview surfaces those decisions while they're still cheap to change. The ADRs let the next person see why the
feature is the way it is.

## Workflow

1. **Establish the feature slug.** Ask for a short kebab-case name if the user hasn't given one (for example
   `ignore-words-per-file-type`, `add-word-quick-pick`). It names the ADR directory. Confirm it before creating files.

2. **Set up a worktree before writing anything.** Do every write for the feature in its own git worktree, so the design
   never sits as uncommitted changes in the user's main checkout. Check for an existing one first, in case this
   continues an earlier session:

    ```sh
    git worktree list
    git branch --list claude-adr-<feature-slug>
    ```

    If neither exists, create both from an up-to-date `origin/main`:

    ```sh
    git fetch origin main
    git worktree add -b claude-adr-<feature-slug> .claude/worktrees/claude-adr-<feature-slug> origin/main
    ```

    - If the branch exists without a worktree, attach it (without `-b`).
    - If a worktree already exists, keep working in it.
    - If the session was given a branch to work on (a cloud session, for example), use that branch instead and skip the
      worktree.
    - Creating the worktree is local and reversible, so no need to ask first. Don't push or open a PR unless asked.

3. **Check the docs structure.**
    - `docs/ADRs/README.md` is the index of features. Read it, and add this feature's bullet (see
      `references/adr-template.md`). Replace the "None yet." line on the first feature.
    - Create `docs/ADRs/<feature-slug>/README.md`, the feature's own index.
    - Read `docs/design-principles.md`, `docs/glossary.md`, and `docs/ADRs/glossary.md` before the first question. Weigh
      every option against the principles, and reuse the glossary's terms.
    - Check `docs/design-notes/` for earlier notes on the same idea. Cite what's relevant in the first ADR's Context.

4. **Interview one decision at a time.** Start with why, before any option:
    - What problem prompted this, and why is it worth doing now? Offer the five whys: ask "why?" of each answer until
      the underlying reason is clear. It's a framework, not a script.
    - Who are the stakeholders, and how is each affected?
    - What does success look like, and what's out of scope?

    Write the answers in the feature's `README.md` under Why, Stakeholders, Goal, and Out of scope. Every later decision
    is weighed against them, and the why is what the archive summary must keep (step 10).

    Then take the decisions one at a time. Don't front-load a questionnaire. Ask one concrete question, let the user
    answer (or say "you decide": then propose a default and state it as the decision), and move on only once it's
    resolved. Read `references/interview-guide.md` before the first question. It's a menu of this repo's real decision
    points; skip what plainly doesn't apply.

    How to ask:
    - **Give lettered options, each with what the user sees or writes.** Show the `settings.json` snippet, the command
      in the palette, or the quick fix in the editor, and what happens, for each option: "(a) … (b) … (c) …". Put your
      recommendation first and say why. Concrete options get decided in one reply; abstract questions don't.
    - **Check facts before asking.** If an option depends on how VS Code, cspell, or the code actually behaves (which
      settings scope wins, what the server receives, whether a `when` clause can express it), find out first and bring
      the result to the question.
    - **Let the user defer.** "Let's circle back" is an answer: note it in the feature's `README.md` under Open
      questions, and come back to it before closing the loop.
    - **Capture side remarks as rules.** A remark made in passing ("settings names are camelCase", "never write to user
      settings without asking") is often a standing rule. Confirm it, then record it where it applies:
      `docs/design-principles.md`, `CONTRIBUTING.md`, `CLAUDE.md`, or memory.

    If a question turns out to have only one reasonable answer once you look at the code, it isn't an ADR. Note it in
    context and move on. ADRs are for decisions where a reasonable person could have gone the other way.

5. **Write one ADR per resolved decision**, not one big document. Batch closely related decisions (a setting's name,
   type, and default can be one ADR). Keep separate what can change separately (a setting's default and which process
   does the work almost always deserve separate ADRs).
    - File: `docs/ADRs/<feature-slug>/NNNN-<decision-slug>.md`, four digits, numbered within the feature from `0001`.
      Check the existing files first, in case this resumes an earlier session.
    - Format: title, status, context, decision, consequences. See `references/adr-template.md`.
    - Status is `Proposed` while under discussion and `Accepted` once the user confirms it. Use `Superseded by NNNN` when
      a later ADR in the same feature overturns one. Leave the old file in place until step 8.
    - Add a row (number, title, status) to the feature's `README.md`.
    - Commit right after writing or editing an ADR, together with its index row. One commit per ADR change, for example
      `docs: add-word-quick-pick ADR 0002, target defaults to workspace`. If the session is cut short, the history shows
      how far the design got.

6. **Keep the glossaries in sync as terms come up**, not just at the end.
    - A term this feature introduces goes in `docs/ADRs/glossary.md`.
    - A repo-wide concept maintainers need to know (about the extension, cspell, or VS Code) goes in `docs/glossary.md`
      instead.
    - A term that starts in the ADR glossary and becomes repo-wide moves to `docs/glossary.md`, and its links are
      updated.
    - Place entries alphabetically, keep definitions short, and link to the ADR that set the term.
    - If a term already has an entry and this feature changes its meaning, update the entry in place and add the new
      source ADR.
    - Skip implementation details with no shared-vocabulary value.
    - Commit glossary edits as they happen.

7. **Close the loop.** Once the open questions are exhausted:
    - Summarize what was decided, one line per ADR, and point at the feature's `README.md`.
    - Say plainly what was left open. A `Proposed` ADR with the unresolved question in its Context carries it forward.
    - List names still marked provisional (the feature index's Provisional names section). Each needs a decision, or a
      tracking issue that says when it must be decided (for example, before the setting ships in a release).
    - Don't write implementation code as part of this skill. The ADRs are the handoff.
    - Tell the user where the work lives: the branch, and the worktree path if there is one. Once its PR merges, remove
      the worktree and delete the branch.

8. **Finalize: squash the ADRs into a tight set.** Only once the user says the design is final, rewrite
   `docs/ADRs/<feature-slug>/` into the smallest set of ADRs that states the final design:
    - Remove superseded ADRs, and any whose content a later one absorbed.
    - Merge ADRs that only refine each other into one that states the end result.
    - Write each remaining ADR as the current decision: no "this supersedes …", no revision history. Rejected
      alternatives stay, briefly, in Context: they are the reason for the decision.
    - Renumber from `0001` in a sensible reading order, mark everything `Accepted`, and update the index, cross-links,
      and glossary links.
    - Commit the consolidation on the same branch. The intermediate history stays in the branch and PR, which is
      squash-merged.

9. **Amend after the design has merged.** Implementation and review can change an accepted decision.
    - Don't rewrite a merged ADR, and don't squash again.
    - Add an `## Amendment: <what changed>` section saying what changed and why, and set the status to
      `Accepted, amended` with a link to the amendment.
    - A change big enough to reverse the decision gets a new ADR that supersedes the old one.
    - Update the glossaries to match.

10. **Archive once the feature has settled**, about three months after it's implemented, or when the user asks:
    - Work on a `claude-archive-<feature-slug>` branch, as in step 2.
    - Note the last commit on `main` that has the full ADRs.
    - Rescue anything still in force first. Search the repo for links to the feature's ADR files (`CLAUDE.md`,
      `CONTRIBUTING.md`, `docs/`, other ADRs, code comments).
        - A principle still in force goes to `docs/design-principles.md`, with a link to the feature.
        - A rule that belongs with a guide, `CONTRIBUTING.md`, or `CLAUDE.md` moves there.
        - Update every link to the new home. A link that only needs the history can point at the permalink below.
        - Never delete a file while something in force still depends on it.
    - Rewrite the feature's `README.md` as the summary (see `references/adr-template.md`): why, stakeholders, goal, what
      was built, each key decision in one line with its reason, and the learnings from implementation and review.
    - Link to the full ADRs in git history: a permalink to the feature's directory at that commit.
    - Delete the individual ADR files. Point glossary links, and any remaining links, at the summary.
    - Mark the feature `(archived)` in `docs/ADRs/README.md`.
    - Open a PR, so the user reviews the summary before the detail leaves the tree.

## Notes

- If the interview shows the request is really a bug fix or a fully specified change, say so and stop. Don't
  manufacture an ADR for something that was never ambiguous.
- Exploratory notes that aren't decisions yet belong in `docs/design-notes/`, not in an ADR.
- ADRs are for maintainers and contributors. Guides and docs for people never point to `CLAUDE.md`.

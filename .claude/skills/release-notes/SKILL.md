---
name: release-notes
description: 'Correct a merged PR''s Release Please changelog entry after its Conventional Commit type or message turned out wrong, for example a PR merged as `fix:`/`feat:` that should have been `chore:`/`refactor:`/`docs:`, a `fix:` that is really a new capability, or a changelog line that users would find confusing. Works by adding a BEGIN_COMMIT_OVERRIDE/END_COMMIT_OVERRIDE block to the merged PR''s description, which Release Please reads on its next run instead of the commit message. Use this whenever the user asks to fix, override, correct, or reclassify a PR''s release notes, changelog entry, or commit message after merge, mentions BEGIN_COMMIT_OVERRIDE, or wants to audit the open release PR (title like "chore(main): release code-spell-checker X.Y.Z") for entries that do not belong in the release notes. Trigger even without the words "release notes": "that PR should not have been a fix", "the changelog has internal stuff in it", "can we reclassify #5482" are all candidates. Does not rewrite git history; only changes what Release Please picks up from now on.'
---

# Release notes override

Correct a Release Please changelog entry after the PR that produced it has merged, by editing the merged PR's
description rather than git history.

## Why this works this way

Release Please builds the version bump and changelog from the squash-merge commit messages on `main`. Rewriting those
would mean force-pushing `main`. Instead, each time Release Please scans for unreleased changes, it re-reads each merged
PR's **description** and looks for a `BEGIN_COMMIT_OVERRIDE`/`END_COMMIT_OVERRIDE` block. Editing a PR description is
safe: no history rewrite, no force-push, and it only affects the next Release Please run.

## Who the release notes are for

People who use the spell checker read the changelog and the GitHub release notes. They skim for changes that affect
them. They don't care about dependency updates, refactors, or tooling. Judge every entry by that reader.

## When to use this

`CONTRIBUTING.md`'s "Commit messages" section says which type a new PR should use. This skill fixes the record when a
PR already merged under the wrong type. It doesn't replace getting the type right at merge time.

## Workflow

### 1. Scope: one PR, or an audit

- The user names a PR ("fix #5482's release note") → go to step 3.
- The user points at the open release PR (title `chore(main): release code-spell-checker X.Y.Z`) → do step 2 first.

### 2. Audit the release PR

Read these first. They are the rules; this step only applies them:

- `CONTRIBUTING.md`'s "Commit messages": which types are shown in the release notes and which are hidden, what `feat`
  and `fix` mean, and the commits whose type is on purpose (cspell updates, `fix: Prepare for Release`). Never propose
  a lower type for those. Do flag a major cspell update that isn't at least `feat:`: it must be at least a minor
  release of the extension.
- `release-please-config.json`'s `changelog-sections`: which section each shown type goes under.

Fetch the release PR's description. It lists the entries by section, each linking to its source PR. For each entry:

- Would a user of the extension notice it? If not, it belongs under a hidden type. Reclassifying it removes it from
  the release notes; it doesn't just move it.
- For a Features entry: is it a new capability? If it only changes existing behavior, it's `fix`.

Present the flagged entries with your reasoning and PR numbers, and get the user's confirmation on which to correct
before touching anything. This is a reading of one-line summaries, not a diff review, so a human makes the call.

### 3. Decide the corrected commit message

For each PR, decide the corrected `type: description`, using the types in `CONTRIBUTING.md`'s "Commit messages".

- A scope is optional, for example `fix(website): …`. Keep the original scope if there was one.
- Use `type!:` for a breaking change.
- For a shown type, write the description for a user of the extension: what changed for them.
- Keep the original wording unless it was also unclear. The goal is the right category, not a rewrite.

### 4. Confirm the PR was squash-merged

`BEGIN_COMMIT_OVERRIDE` only works on squash-merged PRs. Check that the PR's merge commit on `main` has a single parent
and the PR's title as its subject. If the repository settings are available, check that only squash merging is allowed.
If the PR wasn't squash-merged, stop and tell the user.

### 5. Edit the PR description

Fetch the current description and check for an existing `BEGIN_COMMIT_OVERRIDE` block.

- **No block:** add one at the end, separated by a blank line:

    ```text
    BEGIN_COMMIT_OVERRIDE
    chore: add Claude Code skills
    END_COMMIT_OVERRIDE
    ```

    A PR that really held two changes gets one message per paragraph inside the same block.

- **Existing block:** replace its contents. Don't add a second block.

Leave everything else in the description untouched. Show the user the new description, or a clear diff of it, and
confirm before applying it. Editing a merged PR is visible to anyone who reads it later.

Use `gh pr view <N> --json body` and `gh pr edit <N> --body-file <file>` where `gh` is available, or the GitHub tools
available in the session.

### 6. Tell the user what happens next, and offer to trigger it

The override takes effect the next time Release Please runs. It doesn't change an already-open release PR until then.

`.github/workflows/release-please.yml` has `workflow_dispatch`, so offer to run it now (`gh workflow run
release-please.yml`), and point the user at the run so they can watch the release PR update. Confirm first, since it
updates a PR other people may be watching.

Never edit the release PR's description to fix an entry. Release Please regenerates it on every run and overwrites the
edit. The override always goes on the source PR.

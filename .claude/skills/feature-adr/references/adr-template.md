# Templates

## `docs/ADRs/README.md` (the index of features)

The file already exists. Add one bullet per feature under `## Features` when the feature's directory is created, and
remove the "None yet." line on the first one. Don't rewrite existing bullets.

```markdown
- [<feature-slug>](./<feature-slug>/README.md) — <one-line description>
```

## `docs/ADRs/<feature-slug>/README.md` (one per feature)

```markdown
# <Feature Name>

<One or two sentences: what this feature is and why it needed design decisions.>

## Why

- <The problem or pain that prompted this, and who has it.>
- <Why now: the request, issue, or limit that made it worth doing.>
- <Constraints that shape it: VS Code API limits, cspell behavior, compatibility with existing settings, performance.>

## Stakeholders

- **<Who>:** <what it gives them, and how it affects them (what changes, what they need to do).>

## Goal

<What success looks like: something a user can do, or a setting they can write, that they can't today.>

## Out of scope

- <What this feature deliberately doesn't do.>

## Decisions

| #   | Title | Status |
| --- | ----- | ------ |

## Open questions

- <Question deferred during the interview, and what it's waiting on.>

## Provisional names

- `<Name>`: <what it names>. Decide by <when, for example before the setting ships>. Tracked in <issue>.
```

Add one table row per ADR as it's written: `| 0001 | <title> | Accepted |`. Remove the Open questions and Provisional
names sections when they're empty.

## `docs/ADRs/<feature-slug>/NNNN-<decision-slug>.md` (one per decision)

```markdown
# NNNN. <Decision title, phrased as the thing being decided>

Status: Proposed | Accepted | Accepted, amended (see [Amendment](#amendment-...)) | Superseded by [NNNN](./NNNN-slug.md)

## Context

What makes this decision necessary? What constraints apply (VS Code's settings scopes or API, cspell's configuration
rules, the client and server split, existing settings, the design principles)? What are the real options being
weighed, not a setup for a foregone conclusion?

## Decision

The choice that was made, stated plainly ("We will ..."), not a summary of the discussion.

## Consequences

What this makes easier, what it makes harder, and what it rules out. Include concrete effects on this repo, for
example: "the `cSpell.fooBar` name becomes public as soon as it ships, so renaming it later needs a deprecation" or "the
server has to receive the new setting, so it's added to the settings the client sends".
```

Name the file with a kebab-case slug, for example `0001-default-target-is-workspace.md`.

An ADR amended after its design merged gets one more section at the end. Keep the original text as it was:

```markdown
## Amendment: <what changed>

What changed, why (what implementation or review found), and what the decision is now.
```

## `docs/ADRs/<feature-slug>/README.md` after archiving (step 10)

Replaces the feature index and its ADR files. Keep it short: the essence, not the detail.

```markdown
# <Feature Name> (archived)

<One or two sentences: what this feature is.>

The full ADRs are in git history:
[docs/ADRs/<feature-slug> at <short-sha>](https://github.com/streetsidesoftware/vscode-spell-checker/tree/<full-sha>/docs/ADRs/<feature-slug>).

## Why

- <Carried over from the index. This is the part that must survive.>

## Stakeholders

- **<Who>:** <how the finished feature affected them.>

## Goal

<Carried over from the index.>

## What was built

<A few sentences, or a short list: what exists now because of this feature, and where it lives.>

## Key decisions

- **<Decision>.** <Why, in one sentence.>

## Learnings and improvements

- <What implementation or review changed, and what to do differently next time.>
```

In `docs/ADRs/README.md`, mark the feature's bullet `(archived)`.

## `docs/design-principles.md`

The file already exists. Add a principle when a feature sets one that holds beyond the feature, or when an archived
feature's principle is still in force:

```markdown
## <Principle, stated as a rule>

<The rule, and why it holds.> From [<feature-slug>](./ADRs/<feature-slug>/README.md).
```

If a later feature changes a principle, edit it in place and add that feature to its "From" line.

## Glossary entries

Both glossaries use the same entry format. `docs/ADRs/glossary.md` holds terms from ADRs, and `docs/glossary.md` holds
repo-wide concepts.

```markdown
## <Term>

<One or two sentence definition.> Established in [<feature-slug>/NNNN](./<feature-slug>/NNNN-slug.md).
```

The link is relative to the glossary file: from `docs/glossary.md` it is `./ADRs/<feature-slug>/NNNN-slug.md`.

Insert entries alphabetically, and replace the "No terms yet." line on the first one. When a later ADR changes a term's
meaning, edit the entry in place and add its source ADR, rather than adding a second heading.

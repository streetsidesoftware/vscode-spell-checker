# ADR templates

Templates for the files described in the [ADR README](./README.md).

## Row in the Features table

Add one row to the table in [`README.md`](./README.md#features) when a feature's folder is created. Fill in "Shipped"
when the first release containing the feature is published.

```markdown
| [<feature>](./<feature>/README.md) | <one-line description> | <version, YYYY-MM-DD> | Designing / Accepted / Archived |
```

## `docs/ADRs/<feature>/README.md`

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

- <Question deferred during the design, and what it's waiting on.>

## Provisional names

- `<Name>`: <what it names>. Decide by <when, for example before the setting ships>. Tracked in <issue>.
```

Add one row per ADR as it's written: `| 0001 | <title> | Accepted |`. Remove the Open questions and Provisional names
sections when they're empty.

## `docs/ADRs/<feature>/NNNN-<decision>.md`

Name the file with a kebab-case slug, for example `0001-default-target-is-workspace.md`.

```markdown
# NNNN. <Decision title, phrased as the thing being decided>

Status: Proposed | Accepted | Superseded by [NNNN](./NNNN-slug.md)

## Context

What makes this decision necessary? What constraints apply (VS Code's settings scopes or API, cspell's configuration
rules, the client and server split, existing settings, the design principles)? What are the real options being weighed?

## Decision

The choice that was made, stated plainly ("We will ..."), not a summary of the discussion.

## Consequences

What this makes easier, what it makes harder, and what it rules out. Include concrete effects on this repo, for
example: "the `cSpell.fooBar` name becomes public as soon as it ships, so renaming it later needs a deprecation".
```

## Archived `docs/ADRs/<feature>/README.md`

Replaces the feature's index and its ADR files. Keep it short: the essence, not the detail.

```markdown
# <Feature Name> (archived)

<One or two sentences: what this feature is.>

The full ADRs are in git history:
[docs/ADRs/<feature> at <short-sha>](https://github.com/streetsidesoftware/vscode-spell-checker/tree/<full-sha>/docs/ADRs/<feature>).

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

## Design principle entry

For [`../design-principles.md`](../design-principles.md), when a feature sets a principle that holds beyond it:

```markdown
## <Principle, stated as a rule>

<The rule, and why it holds.> From [<feature>](./ADRs/<feature>/README.md).
```

If a later feature changes a principle, edit it in place and add that feature to its "From" line.

## Glossary entry

Both glossaries use the same format. Link to the feature's `README.md`, not to a single ADR, so the link survives
archiving.

```markdown
## <Term>

<One or two sentence definition.> From [<feature>](./<feature>/README.md).
```

From the main glossary (`docs/glossary.md`) the link is `./ADRs/<feature>/README.md`. Insert entries alphabetically.
When a later feature changes a term's meaning, edit the entry in place and add that feature.

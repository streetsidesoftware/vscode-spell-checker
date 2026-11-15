# Designing a feature

A design helps you think a change through before and while you build it. It holds decisions and their reasons: why the
change is needed, who it affects, and what was chosen. It's for whoever builds the change, for the people who review
it, and for anyone who later wonders why it's shaped the way it is.

A design doesn't describe how the code behaves. The code, tests, and docs are the source of truth, and most readers
assume a design is out of date. It isn't a contract either: when building or using a feature shows a better answer,
change the design.

## When to write one

It's never required. Write one when you want to think before building, or when a reviewer suggests it. It's worth it
when a change has more than one reasonable answer, especially when the choice is hard to undo once it ships:

- a setting's name, type, scope, or default
- a command id, or where it appears
- a change to what gets flagged
- an action that writes to users' settings, cspell config files, or dictionaries
- a change to the API other extensions call

Skip it for bug fixes, refactors, dependency updates, and changes whose behavior is already fully specified.
Exploratory notes and ideas nobody has decided to pursue go in [`design-notes/`](./design-notes/README.md) or in an
issue.

## Where it lives

Start with one file, `docs/designs/<feature>.md`, named by a short kebab-case slug, such as `add-word-quick-pick`. Add a
line for it to the list in [`docs/designs/README.md`](./designs/README.md) in the same PR.

Not every design fits in one file. When a part can be read on its own, move the design to a folder:

- `docs/designs/<feature>/README.md` keeps the why, the sketch, links to the other files, and the open questions.
- Each other file covers one topic, named by a slug, such as `config-targets.md`.

Edit the files in place as the design changes. Git history keeps the earlier versions, so the files don't have to.

Open the PR as soon as you want feedback. A small feature can ship its design and code together in one PR, and the code
decides the PR's type. When a design is worth reviewing before it's built, merge it on its own with a `docs:` PR, so it
stays out of the release notes. See [Commit messages](../CONTRIBUTING.md#commit-messages).

## The file

```markdown
# <Feature>

## Why

<The problem, who has it, and what they can't do today. A few lines.>

## Design

<The sketch: the shape of the solution in a few lines, with one example of what a user writes (`settings.json` or a
cspell config file) or does (a command, a quick fix), and what the extension does. Then each choice that could change
the sketch or is hard to undo, with its reason.>

## Open questions

- <A side question or deferred point, in one line.>
```

- Add anything else the reader needs to understand the why, such as who it affects, under Why.
- Record what's out of scope only when a reader would otherwise assume the feature covers it.
- Keep a name only when it's user-visible and part of the decision, such as a setting, a command id, or a command
  title. Internal names tie the design to the code.
- Say when a choice is only for now, such as "could be added later". Otherwise a later reader takes it as a lasting
  rule.
- Define a new term where it's first used. If it's used across the repo, add it to the [glossary](./glossary.md) in the
  same PR.

## How to design

Work from the top down, and stop when the code is the easier way to answer the rest.

### 1. Get to the why

A change usually starts as a problem to solve, or as a solution ("we need a setting"). Ask "why?" until you reach the
reason: who is affected, and what goes wrong for them today. Look at the issue and the code first, so the why rests on
facts. Then ask why now, what success looks like, and what's out of scope.

### 2. Sketch the design

Write the shape of the solution in a few lines, with one example: what a user writes in their settings or cspell config,
or the command or quick fix they use, and what the extension does.

### 3. Work through the questions

Go through the [design questions](./design-questions.md), which include the
[design principles](./design-principles.md). Spend time on a question when its answer could change the sketch, or
would be hard to undo once it ships. Settle anything else with a sensible default. When a detail shows the sketch is
wrong, change the sketch.

### 4. Note side questions

Write each in a line under Open questions, and set it aside. The code usually settles them.

### 5. Let the code settle the rest

When a question is easier to answer by building or trying something, stop designing and build. Update the design when
the code shows a decision was wrong.

## Before merge

Finish the design in the same PR. This removes the working notes, not the reasons.

- Add a `tl;dr` at the top: the choices that matter, in short, plain sentences.
- Add a line saying that the code and docs are the source of truth.
- Keep each decision with its reason.
- Keep an idea that wasn't chosen only when it's a real lesson that would save the next person from repeating it, and
  write it in the decision's text. A list of rejected ideas reads as a firm ruling, and can stop a later improvement.
- Cut what only restates the code, such as function names and internal steps.
- Settle or drop each open question, and remove the section. Open an issue only for a real problem someone would act
  on.
- List what isn't built yet, if the design merges first.
- In a folder, the `tl;dr` and that line go in the `README.md`. Finish each other file the same way, and delete one that
  no longer adds anything.
- Have someone new to the feature read only the design, without the code. They should be able to say what was decided,
  why, and how the decisions fit together.

If the design set a rule that holds beyond this feature, add it to the [design principles](./design-principles.md) or
the doc under `docs/` where it applies.

## Changing a merged design

Update a design only when the design changes: a decision, or the reason for it. Don't update it because the code
changed, except to take a finished item off its list of what isn't built yet.

- Rewrite the decision in place. Say what showed the old choice was wrong, if that would save the next person from
  repeating it.
- Delete a part that no longer applies. Git history keeps it.

## With Claude Code

The `feature-design` skill runs this as an interview. It can also check a small change for side effects before it's
built.

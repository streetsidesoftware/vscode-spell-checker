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

- `docs/designs/<feature>/README.md` keeps the why, the overview, links to the other files, and the open questions.
- Each other file covers one part or topic, named by a slug, such as `config-targets.md`.

Edit the files in place as the design changes. Git history keeps the earlier versions, so the files don't have to.

Open a draft PR once the design has its first commit, and push each decision as it's settled. Reviewers read the design
in the PR as it grows, not in pieces in a chat or an issue. PRs are squash-merged, so the number of commits doesn't
matter.

A small feature can ship its design and code together in one PR, and the code decides the PR's type. When a design is
worth reviewing before it's built, merge it on its own with a `docs:` PR, so it stays out of the release notes. See
[Commit messages](../CONTRIBUTING.md#commit-messages).

## The file

```markdown
# <Feature>

## Why

<The problem, who has it, and what they can't do today. A few lines.>

## Overview

<The approach and the whole shape: what a user writes (`settings.json` or a cspell config file) or does (a command, a
quick fix), and what the extension does, with one example. The main parts. Each decision the approach rests on, with
its reason. After the parts are done, the whole-feature answers, such as how it's released.>

## <Part>

<One section per part of the overview: its details, each with its reason.>

## Open questions

- <A side question, a deferred point, or a detail parked until its part comes up, in one line.>
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

A design works at two levels:

- **The overview:** the approach, and the whole shape of the feature.
- **The details:** how each part works.

A part is a piece of the feature that can be designed on its own, such as a setting, a command, or the config targets
an action writes to. The overview names the parts.

Each level has two phases:

- **Explore:** discuss the problem and the options, research what you don't know, and try things. Nothing is decided
  yet.
- **Decide:** choose, and write the choice down with its reason.

Finish the overview before starting on the details. A detail decided while the overview is still moving often has to
be decided again. A design that dives into details early gets lost in them. Until the overview is agreed, names and
shapes in an example are placeholders. A detail question is parked under Open questions, and comes back with its part.

### 1. Get to the why

A change usually starts as a problem to solve, or as a solution ("we need a setting"). Ask "why?" until you reach the
reason: who is affected, and what goes wrong for them today. Look at the issue and the code first, so the why rests on
facts. Then settle why now, what success looks like, and what's out of scope. Fill in what the issue and the code
show, and ask about the rest.

### 2. Explore approaches

Find the approaches that could solve the why, usually two or three. For each, sketch what a user writes or does, and
what the extension does. Compare them against the overview questions in the [design questions](./design-questions.md),
which include the [design principles](./design-principles.md). Research what you don't know. Write the approaches
under Overview while you explore.

### 3. Decide the overview

Choose an approach, and write the Overview in place of the approaches explored: the shape in a few lines with one
example, the main parts, and each decision the approach rests on, with its reason.

### 4. Agree on the whole overview

Read the whole overview as one piece, with whoever reviews the design. It's ready when these are all settled:

- the approach;
- what users see;
- the parts;
- the decisions the approach rests on.

The details start only once it's agreed.

### 5. Work through each part

Take the parts one at a time, and for each, explore before deciding:

- **Explore:** what the part has to handle, what VS Code and cspell allow, and what's unclear. Pick up its parked
  details.
- **Decide:** work through the detail questions in the [design questions](./design-questions.md). Spend time on a detail
  when it's hard to undo once it ships, or could change the overview. Settle the rest with sensible defaults, and list
  them in the part's section, so a reviewer can check them at a glance.

### 6. Go back up when a detail challenges the overview

When a detail shows the overview is wrong, stop working on the details. Change the overview: explore again as in step
2 if the approach itself is in question, then decide as in step 3. Agree on it again as in step 4. Then go back over the
details already decided that depend on what changed.

### 7. Settle the whole-feature questions

After the last part, or before you stop designing to build, work through the whole-feature questions in the
[design questions](./design-questions.md) once, such as how the feature is released and which docs change. Write the
answers in the Overview. They don't reopen it, unless one shows the approach is wrong: then go back up as in step 6.

### 8. Let the code settle the rest

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
- When the overview changes, check the details that depend on it.
- Delete a part that no longer applies. Git history keeps it.

## With Claude Code

The `feature-design` skill runs this as an interview. It can also check a small change for side effects before it's
built.

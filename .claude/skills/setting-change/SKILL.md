---
name: setting-change
description: 'Add or change a Code Spell Checker extension setting (cSpell.*) end to end: a new setting, a changed default or type, a rename, a deprecation, or a removal. Runs a short design checklist, hands over to feature-adr when a decision is open, then defines the setting, regenerates the schema, package.json and website docs, wires it into the client or server, adds tests, and drafts the commit message and PR description. Use this whenever the user asks to add, change, rename, deprecate, or remove a setting, or to expose an option in VS Code settings, even if they do not say "skill". Do not use it for commands (see docs/settings-and-commands.md) or for designing the planned settings migration command (use feature-adr).'
---

# setting-change

Adds or changes an extension setting following `docs/settings-and-commands.md`. Read that file first: it is the
procedure. This skill adds the design checklist, the order of work, and the release drafts.

A setting is public as soon as it ships. Its name, type, scope, and default end up in people's `settings.json`, and a
change that ignores their existing values breaks their setup. So the design comes first, and existing values always
keep working.

## Workflow

### 1. Identify the change

Ask what the user wants, if it isn't clear, and name the kind of change:

- add a setting
- change a default
- change a type
- rename a setting
- deprecate a setting
- remove a setting

Read the matching section of `docs/settings-and-commands.md`, and `docs/design-principles.md`.

### 2. Check whether removal is allowed

For a removal, check the rule in "Removing a setting" before anything else:

- Is the setting deprecated?
- Has the migration offer shipped, followed by at least one minor release?

If either answer is no, stop and tell the user why the setting can't be removed yet. Offer to deprecate it instead, if
it isn't already.

### 3. Run the design checklist

Ask one question at a time. Check facts in the code before asking (existing names, similar settings, what the client or
server does today), and bring them to the question. Give lettered options, each with the `settings.json` a user would
write, and your recommendation first.

For a new setting:

- **Name:** `cSpell.<name>`, consistent with related settings.
- **Type and shape:** would an enum or object leave room to grow better than a boolean?
- **Default:** quiet and accurate, per the "keep false positives low" principle. Does it change anything for existing
  users?
- **Scope:** `application`, `window`, `resource`, or `language-overridable`.
- **Section:** which settings section it belongs in.
- **Who reads it:** the client, the server, or both.
- **Description:** what the setting does and when to change it, with an example if it helps.

For a change:

- **What changes for users,** and how they keep the old behavior.
- **Compatibility:** how existing values keep working (see the doc's rename and type sections).
- **The replacement,** for a deprecation: the new setting, or the reason there is none.

**Hand over to feature-adr** when an answer has more than one reasonable option with lasting effects, for example a new
name that other settings will follow, a new object shape, or a default that changes what gets flagged. Say so, and
offer to run the `feature-adr` skill. Continue here once the design is decided.

Record the answers. They go into the PR description in step 6.

### 4. Implement

Follow the doc's steps for the kind of change. Don't skip one:

- Define or change the property and its doc comment. The doc comment is user documentation: follow
  `CONTRIBUTING.md`'s "Writing for users", and use escapes or the zero-width space rule from "Invisible characters".
- Put it in its section, or move it to Legacy when deprecating.
- Keep `ConfigFields` and `configDefaults` in step.
- Wire it into the code that uses it. For a rename, read the old setting first and let the new one override it, and
  write only the new name.
- Add tests next to the code. For a rename, cover old only, new only, and both.

Never edit generated files by hand. Regenerate them:

```sh
npm run build
npm run gen-docs
```

### 5. Verify

```sh
npm test
npm run lint
npx cspell . --dot --no-progress
```

- `npm run build` must run before `npm test`: the `configDefaults` test reads the generated schema.
- Check the diff: the setting in `package.json` `contributes.configuration`, both schema files, and the matching
  `website/docs/configuration/auto_*.md` page. Nothing else generated should change.
- `npm run lint` writes fixes. Check the diff afterwards.

### 6. Draft the commit message and PR description

A setting change is read by the people who use the extension, so it goes in the release notes. Follow
`CONTRIBUTING.md`'s "Commit messages" and "Pull request descriptions".

- **Type:**
    - `feat:` for a new setting that lets users do something new.
    - `fix:` for a changed default or type, a rename, or a deprecation.
    - Add `!` when a setup that works today would break.
- **Subject:** what changed for users, not how the code changed.
- **Description:** a `## Summary`, and for `feat:` a `## Feature` section with a `settings.json` example and the design
  answers from step 3 that shape how to use it.

Show the drafts to the user. Don't commit, push, or open a PR until they say so.

## Notes

- The planned migration command, which moves deprecated settings to their replacements, doesn't exist yet. Until it
  does, reading the old setting as a fallback is what keeps old values working, and no deprecated setting can be
  removed.
- If the request turns out to need no setting at all, say so and stop.

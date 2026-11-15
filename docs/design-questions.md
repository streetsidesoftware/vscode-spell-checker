# Design questions

The questions a [design](./feature-design.md) covers, and where this repo's hard-to-undo decisions hide. There are
three kinds:

- **[Overview questions](#overview-questions)** shape the approach. Work through them while exploring approaches and
  deciding the overview.
- **[Detail questions](#detail-questions)** shape each part. Work through them part by part, once the overview is
  agreed.
- **[Whole-feature questions](#whole-feature-questions)** cover the feature as one change. Work through them once,
  after the last part.

All the overview groups apply to every change. Most changes touch two or three groups of detail questions. Spend time
on a question when its answer could change the overview or would be hard to undo once it ships. Settle the rest with a
proposed default, such as "the other settings do Y".

## Overview questions

### Why and who

Always first.

- Why are we doing this? What problem prompted it? Is there an issue?
- Why now: a bug report, a feature request, a limit hit while building something else?
- If the first answer is a solution ("we need a new setting"), ask why until the reason is clear.
- Who is affected, and how? Usually some of:
    - people who use the extension and edit their settings or a cspell config file;
    - teams that share a cspell config between the extension and the cspell command-line tool, and expect the same
      results from both;
    - other extensions that call the extension's API (`packages/client/src/extensionApi.mts`);
    - cspell itself, when the change belongs in cspell rather than in the extension;
    - maintainers of this repo.
- What does success look like, as something a user can do or a setting they can write, that they can't today?
- What's out of scope?

### The platform's fixed rules

What VS Code and cspell fix and this repo can't change. Every approach has to fit them, and many questions are settled
by pointing back at them. At the overview level, check the ones that could rule out an approach, rather than assuming
them. The rest come up with their part. Note the ones that matter next to the decision they shape.

- **VS Code settings:** the scopes (`application`, `window`, `resource`, `language-overridable`) and which one wins;
  whether a setting can be changed per folder or per language.
- **Static contributions:** `package.json` `contributes` (settings, commands, menus, `when` clauses) is fixed at
  install time.
- **Restricted environments:** in virtual and untrusted workspaces, JavaScript config files and `node_modules` aren't
  loaded (see `capabilities` in `package.json`).
- **The client and server split:** what the server can know about the editor, and what has to be sent from the client.
- **cspell's own configuration rules:** how cspell merges config files, and what the command-line tool would do with
  the same config.

### Principles

Check each approach against the [design principles](./design-principles.md):

- **An action changes only what the user picked.** Does it write to a place the user didn't choose?
- **Keep false positives low.** Does it flag more words by default?

If the change needs a new principle, agree on it before the decisions that depend on it.

### The approach

- **What users see.** What does a user write or do, and what does the extension do in return? Is it a setting, a
  command or quick fix, a view, or a change to how documents are checked?
- **Where it belongs.** Which packages does it touch: the client, the server, the webview? Does it belong in cspell
  rather than in the extension?
- **Where the work runs.** Client or server? What has to cross between them, and how often?
- **What it writes.** Does it write anything? To which [config target](./glossary.md#config-target): settings, a cspell
  config file, or a dictionary file? Who chooses: the user, a setting, or a prompt?
- **Existing users.** Does it change a default, what gets flagged, or the meaning of an existing setting or command?
- **Hard to undo.** Which choices become public as soon as it ships: a setting's name or shape, a command id, what gets
  flagged?

## Detail questions

### Settings

For a new or changed setting (see [Settings and commands](./settings-and-commands.md)):

- **Name.** Settings are named `cSpell.<name>`. Does it match the naming of related settings? Names are public as soon
  as they ship.
- **Type and shape.** A boolean now often becomes an enum later. Would an object or enum leave room to grow?
- **Default.** Prefer quiet and accurate. Does the default change behavior for existing users?
- **Scope.** Which scope, and why? Does it need to differ per language?
- **Section.** Which settings section does it belong in?
- **cspell config files.** Can the same thing be set in a cspell config file? If both are set, which wins, and does
  `cSpell.mergeCSpellSettings` affect it?
- **Replacing a setting.** Is an old setting deprecated? How do the two coexist, what does the deprecation message say,
  and when is the old one removed?
- **Documentation.** The doc comment is the user documentation: what does it say, and what example does it show?

### Commands, menus, and actions

- **Command id and title.** The id is `cSpell.<name>`, and the title shows in the Command Palette. Ids are public:
  keybindings and other extensions use them.
- **Where it appears.** Command Palette, context menus, the editor title, the status bar, code actions? Which `when`
  clause controls it?
- **Scope.** At which scope does it write: user, workspace, or folder?
- **Confirmation.** Does it ask before writing? What does it do when the target doesn't exist yet?
- **Undo.** Can the user undo it with the editor's undo, or only by hand?

### Behavior and performance

- **Large documents.** How does it behave near the performance limits (`cSpell.checkLimit`, `cSpell.spellCheckDelayMs`,
  the `blockChecking…` settings)?
- **Edge cases.** Multi-root workspaces, no workspace, untitled documents, notebooks, virtual workspaces, remote
  development.
- **Errors.** Which mistakes are reported, where (a notification, the output channel, a diagnostic), and how loudly?

### Webview and views

For changes to the Spell Checker info view or the tree views:

- What does the view show, and what can the user do from it?
- Which data does it need from the extension or the server, and through which API (`packages/webview-api`)?
- How does it update when settings or documents change?

### Testing and samples

- Which unit tests cover it, and in which package?
- Does it need an integration test (`packages/_integrationTests`), or a sample workspace in `fixtures/workspaces/`?
- Which edge cases from [Behavior and performance](#behavior-and-performance) need a test?

## Whole-feature questions

### Release surface

- Is it `feat:` or `fix:`, and is it breaking (`!`)? What will the release note say, for someone who uses the spell
  checker? See [Commit messages](../CONTRIBUTING.md#commit-messages).
- Does it ship in prerelease mode first?
- Which docs change: the root `README.md`, the website, the generated settings pages?
- Is any name still provisional? Each needs a decision, or an issue saying when it must be decided.

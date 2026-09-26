# Interview guide

A menu of the decision points that recur in this repo, grouped by theme. Most features touch two or three groups. Ask
one question, resolve it, write it down (as an ADR if it's a real judgment call, or in another ADR's Context if it's a
detail), then move on.

Where a question has an obvious, low-stakes default given the rest of the repo, propose it up front ("I'd default to X
because the other settings do Y. Any reason to differ here?"). That's still an ADR if the user could reasonably have
picked differently; it just makes the interview faster.

## 0. Why, stakeholders, and the goal (always first)

- Why are we doing this? What problem or pain prompted it? Is there an issue?
- Why now: a bug report, a feature request, a limit hit while building something else?
- If the first answer is a solution ("we need a new setting") rather than a reason, try the five whys. Stop as soon as
  the reason is clear.
- Who are the stakeholders, and how is each affected? In this repo that's usually:
    - people who use the extension and edit their settings or a cspell config file;
    - teams that share a cspell config between the extension and the cspell command-line tool, and expect the same
      results from both;
    - other extensions that call the extension's API (`packages/client/src/extensionApi.mts`);
    - maintainers of this repo;
    - cspell itself, when the change belongs in cspell rather than in the extension.
- What does success look like, as something a user can do or a setting they can write, that they can't today?
- What's deliberately out of scope?

Record the answers in the feature's `README.md` before the first decision.

## 1. The platform's fixed rules

Before any option, list what VS Code and cspell fix and this repo can't change. Write them in the first ADR's Context.
Many later questions are settled by pointing back at them. Check each one rather than assuming it.

- **VS Code settings:** the scopes (`application`, `window`, `resource`, `language-overridable`) and which one wins;
  whether a setting can be changed per folder or per language.
- **Static contributions:** `package.json` `contributes` (settings, commands, menus, `when` clauses) is fixed at
  install time.
- **Restricted environments:** in virtual and untrusted workspaces, JavaScript config files and `node_modules` aren't
  loaded (see `capabilities` in `package.json`).
- **The client and server split:** what the server can know about the editor, and what has to be sent from the client.
- **cspell's own configuration rules:** how cspell merges config files, and what the command-line tool would do with
  the same config.

## 2. Principles

Read `docs/design-principles.md` and weigh every option against it:

- **An action changes only what the user picked.** Does any option write to a place the user didn't choose?
- **Keep false positives low.** Does any option flag more words by default?

If the feature needs a new principle, agree on it first, record it as ADR `0001`, and add it to
`docs/design-principles.md` when it holds beyond this feature.

## 3. Settings

For a new or changed setting (see `docs/settings-and-commands.md`):

- **Name.** `cSpell.<name>`. Does it match the naming of related settings? Names are public as soon as they ship.
- **Type and shape.** A boolean now often becomes an enum later. Would an object or enum leave room to grow?
- **Default.** Prefer quiet and accurate. Does the default change behavior for existing users?
- **Scope.** Which scope, and why? Does it need to differ per language?
- **Section.** Which settings section does it belong in?
- **cspell config files.** Can the same thing be set in a cspell config file? If both are set, which wins, and does
  `cSpell.mergeCSpellSettings` affect it?
- **Replacing a setting.** Is an old setting deprecated? How do the two coexist, what does the deprecation message say,
  and when is the old one removed?
- **Documentation.** The doc comment is the user documentation: what does it say, and what example does it show?

## 4. Commands, menus, and actions

- **Command id and title.** `cSpell.<name>`, and the title in the Command Palette. Ids are public: keybindings and other
  extensions use them.
- **Where it appears.** Command Palette, context menus, the editor title, the status bar, code actions? Which `when`
  clause controls it?
- **What it writes.** Which config target (see `docs/glossary.md`) does it change: settings, a
  cspell config file, or a dictionary file, and at which scope? Who chooses: the user, a setting, or a prompt?
- **Confirmation.** Does it ask before writing? What does it do when the target doesn't exist yet?
- **Undo.** Can the user undo it with the editor's undo, or only by hand?

## 5. Behavior and performance

- **Where the work runs.** Client or server? What has to cross between them, and how often?
- **Large documents.** How does it behave near the performance limits (`cSpell.checkLimit`, `cSpell.spellCheckDelayMs`,
  the `blockChecking…` settings)?
- **Edge cases.** Multi-root workspaces, no workspace, untitled documents, notebooks, virtual workspaces, remote
  development.
- **Errors.** Which mistakes are reported, where (a notification, the output channel, a diagnostic), and how loudly?

## 6. Webview and views

For changes to the Spell Checker info view or the tree views:

- What does the view show, and what can the user do from it?
- Which data does it need from the extension or the server, and through which API (`packages/webview-api`)?
- How does it update when settings or documents change?

## 7. Testing and samples

- Which unit tests cover it, and in which package?
- Does it need an integration test (`packages/_integrationTests`), or a sample workspace in `fixtures/workspaces/`?
- Which edge cases from group 5 need a test?

## 8. Release surface

- Is it `feat:` or `fix:`? What will the release note say, for someone who uses the spell checker?
- Does it ship in prerelease mode first?
- Which docs change: the root `README.md`, the website, the generated settings pages?
- Is any name still provisional? List it in the feature index, with when it must be decided.

## Wrapping a topic into a decision

Not every answer needs its own ADR. Bundle answers from the same group when they only make sense read together (a
setting's name, type, and default). Split them when they can change independently later (a setting's default and
where the work runs).

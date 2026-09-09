---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mts`
title: Menus and Actions
id: menus-and-actions
---

# Menus and Actions

Settings that control the menu items and actions available in the spell checker.


<table>
<thead>
<tr>
<th>

Setting

</th>
<th>

Scope

</th>
<th>

Description

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

[`cSpell.hideAddToDictionaryCodeActions`](#cspellhideaddtodictionarycodeactions)

</td>
<td>

resource

</td>
<td>

Hide the options to add words to dictionaries or settings.

</td>
</tr>
<tr>
<td>

[`cSpell.menuItemsOnCSpellConfigMenu`](#cspellmenuitemsoncspellconfigmenu)

</td>
<td>



</td>
<td>

Control which menu items are shown on the Spelling Config Menu.

</td>
</tr>
<tr>
<td>

[`cSpell.menuItemsOnEditorContextMenu`](#cspellmenuitemsoneditorcontextmenu)

</td>
<td>



</td>
<td>

Control which menu items are shown on the Editor Context Menu.

</td>
</tr>
<tr>
<td>

[`cSpell.menuItemsOnSpellingContextMenu`](#cspellmenuitemsonspellingcontextmenu)

</td>
<td>



</td>
<td>

Control which menu items are shown on the Spelling Context Menu.

</td>
</tr>
<tr>
<td>

[`cSpell.showCommandsInEditorContextMenu`](#cspellshowcommandsineditorcontextmenu)

</td>
<td>

application

</td>
<td>

Show Spell Checker actions in Editor Context Menu

</td>
</tr>
<tr>
<td>

[`cSpell.showSuggestionsLinkInEditorContextMenu`](#cspellshowsuggestionslinkineditorcontextmenu)

</td>
<td>

application

</td>
<td>

Show Spelling Suggestions link in the top level context menu.

</td>
</tr>
<tr>
<td>

[`cSpell.suggestionMenuType`](#cspellsuggestionmenutype)

</td>
<td>

resource

</td>
<td>

The type of menu used to display spelling suggestions.

</td>
</tr>
</tbody>
</table>


## Settings


### `cSpell.hideAddToDictionaryCodeActions`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.hideAddToDictionaryCodeActions`

</dd>

<dt>
Description
</dt>
<dd>

Hide the options to add words to dictionaries or settings.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

</dl>

---


### `cSpell.menuItemsOnCSpellConfigMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.menuItemsOnCSpellConfigMenu`

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Spelling Config Menu.

</dd>

<dt>
Type
</dt>
<dd>

[`EnabledItemsOnCSpellConfigMenu`](#enableditemsoncspellconfigmenu)

</dd>

<dt>
Scope
</dt>
<dd>

_- none -_

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "createCSpellConfig": true,
  "createCustomDictionary": true
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---


### `cSpell.menuItemsOnEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.menuItemsOnEditorContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Editor Context Menu.

</dd>

<dt>
Type
</dt>
<dd>

[`EnabledItemsOnEditorContextMenu`](#enableditemsoneditorcontextmenu)

</dd>

<dt>
Scope
</dt>
<dd>

_- none -_

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "hideIssues": true,
  "showIssues": true,
  "spellingContextMenu": true,
  "suggestSpellingCorrections": true
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---


### `cSpell.menuItemsOnSpellingContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.menuItemsOnSpellingContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Spelling Context Menu.

</dd>

<dt>
Type
</dt>
<dd>

[`EnabledItemsOnSpellingContextMenu`](#enableditemsonspellingcontextmenu)

</dd>

<dt>
Scope
</dt>
<dd>

_- none -_

</dd>

<dt>
Default
</dt>
<dd>

```json5 title="default"
{
  "addIgnoreWord": true, "addIssuesToDictionary": true,
  "addWordToCSpellConfig": true, "addWordToDictionary": true,
  "addWordToFolderDictionary": true, "addWordToFolderSettings": true,
  "addWordToUserDictionary": true, "addWordToUserSettings": true,
  "addWordToWorkspaceDictionary": true, "addWordToWorkspaceSettings": true,
  "suggestSpellingCorrections": true
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---


### `cSpell.showCommandsInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showCommandsInEditorContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Show Spell Checker actions in Editor Context Menu

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.showSuggestionsLinkInEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.showSuggestionsLinkInEditorContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Show Spelling Suggestions link in the top level context menu.

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

<dt>
Scope
</dt>
<dd>

application - Settings that apply to all instances of VS Code and can only be configured in user settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.suggestionMenuType`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.suggestionMenuType`

</dd>

<dt>
Description
</dt>
<dd>

The type of menu used to display spelling suggestions.

</dd>

<dt>
Type
</dt>
<dd>

**Any of:**

<ul>

<li>

`"quickPick"`
</li>
<li>

`"quickFix"`
</li>

</ul>

`( "quickPick" | "quickFix" )`
| Value | Description |
| ----- | ----------- |
| `quickPick` | Suggestions will appear as a drop down at the top of the IDE. (Best choice for Vim Key Bindings) |
| `quickFix` | Suggestions will appear inline near the word, inside the text editor. |

</dd>

<dt>
Scope
</dt>
<dd>

resource - Resource settings, which apply to files and folders, and can be configured in all settings levels, even folder settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"quickPick"`_

</dd>

</dl>

---


## Type Definitions


### `EnabledItemsOnCSpellConfigMenu`

<dl>

<dt>
Name
</dt>
<dd>

EnabledItemsOnCSpellConfigMenu

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Spelling Config Menu.

</dd>

<dt>
Type
</dt>
<dd>

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`createCSpellConfig`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Create a CSpell Configuration File

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`createCustomDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Create a Custom Dictionary File

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

```ts
{
  createCSpellConfig?: boolean;
  createCustomDictionary?: boolean;
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---


### `EnabledItemsOnEditorContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

EnabledItemsOnEditorContextMenu

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Editor Context Menu.

</dd>

<dt>
Type
</dt>
<dd>

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`hideIssues`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: `Hide Spelling Issues`

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`showIssues`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: `Show Spelling Issues`

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`spellingContextMenu`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: `Spelling`

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`suggestSpellingCorrections`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: `Spelling Suggestions...`

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

```ts
{
  hideIssues?: boolean;
  showIssues?: boolean;
  spellingContextMenu?: boolean;
  suggestSpellingCorrections?: boolean;
}
```

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---


### `EnabledItemsOnSpellingContextMenu`

<dl>

<dt>
Name
</dt>
<dd>

EnabledItemsOnSpellingContextMenu

</dd>

<dt>
Description
</dt>
<dd>

Control which menu items are shown on the Spelling Context Menu.

</dd>

<dt>
Type
</dt>
<dd>

<table>
<thead>
<tr>
<th>

Fields

</th>
</tr>
</thead>
<tbody>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addIgnoreWord`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Ignore Word

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addIssuesToDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add All Spelling Issues to Dictionary

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToCSpellConfig`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to CSpell Configuration

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to Dictionary

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToFolderDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to Folder Dictionary

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToFolderSettings`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to Folder Settings

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToUserDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to User Dictionary

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToUserSettings`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to User Settings

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToWorkspaceDictionary`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to Workspace Dictionary

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`addWordToWorkspaceSettings`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Add Word to Workspace Settings

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
<tr>
<td>

<dl>

<dt>
Name
</dt>
<dd>

`suggestSpellingCorrections`

</dd>

<dt>
Description
</dt>
<dd>

Enable Menu Item: Spelling Suggestions...

</dd>

<dt>
Type
</dt>
<dd>

`boolean`

</dd>

</dl>

</td>
</tr>
</tbody>
</table>

<details>
<summary>

TypeScript:

</summary>

```ts
{
  addIgnoreWord?: boolean;
  addIssuesToDictionary?: boolean;
  addWordToCSpellConfig?: boolean;
  addWordToDictionary?: boolean;
  addWordToFolderDictionary?: boolean;
  addWordToFolderSettings?: boolean;
  addWordToUserDictionary?: boolean;
  addWordToUserSettings?: boolean;
  addWordToWorkspaceDictionary?: boolean;
  addWordToWorkspaceSettings?: boolean;
  suggestSpellingCorrections?: boolean;
}
```

</details>

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.9.1

</dd>

</dl>

---





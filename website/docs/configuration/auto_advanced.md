---
# AUTO-GENERATED ALL CHANGES WILL BE LOST
# See `_scripts/extract-config.mjs`
title: Advanced
id: advanced
---

# Advanced

Advanced settings that are not commonly used.


| Setting | Scope | Description |
| ------- | ----- | ----------- |
| [`cSpell.advanced.feature.useReferenceProviderRemove`](#cspelladvancedfeatureusereferenceproviderremove) | language-overridable | Remove Matching Characters Before Rename |
| [`cSpell.advanced.feature.useReferenceProviderWithRename`](#cspelladvancedfeatureusereferenceproviderwithrename) | language-overridable | Use Reference Provider During Rename |
| [`cSpell.fixSpellingWithRenameProvider`](#cspellfixspellingwithrenameprovider) | language-overridable | Use Rename Provider when fixing spelling issues. |
| [`cSpell.logFile`](#cspelllogfile) | window | Write Logs to a File |
| [`cSpell.logLevel`](#cspellloglevel) | window | Set Logging Level |
| [`cSpell.trustedWorkspace`](#cspelltrustedworkspace) | window | Enable loading JavaScript CSpell configuration files. |


## Settings


### `cSpell.advanced.feature.useReferenceProviderRemove`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.advanced.feature.useReferenceProviderRemove` -- Remove Matching Characters Before Rename

</dd>

<dt>
Description
</dt>
<dd>

Used to work around bugs in Reference Providers and Rename Providers.
Anything matching the provided Regular Expression will be removed from the text
before sending it to the Rename Provider.

See: [Markdown: Fixing spelling issues in Header sections changes the entire line · Issue #1987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/1987)

It is unlikely that you would need to edit this setting. If you need to, please open an issue at
[Spell Checker Issues](https://github.com/streetsidesoftware/vscode-spell-checker/issues)

This feature is used in connection with [`cSpell.advanced.feature.useReferenceProviderWithRename`](advanced#cspelladvancedfeatureusereferenceproviderwithrename)

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

language-overridable - Resource settings that can be overridable at a language level.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.advanced.feature.useReferenceProviderWithRename`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.advanced.feature.useReferenceProviderWithRename` -- Use Reference Provider During Rename

</dd>

<dt>
Description
</dt>
<dd>

Use the Reference Provider when fixing spelling issues with the Rename Provider.
This feature is used in connection with [`cSpell.fixSpellingWithRenameProvider`](advanced#cspellfixspellingwithrenameprovider)

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>

<dt>
Default
</dt>
<dd>

_`false`_

</dd>

</dl>

---


### `cSpell.fixSpellingWithRenameProvider`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.fixSpellingWithRenameProvider`

</dd>

<dt>
Description
</dt>
<dd>

Use Rename Provider when fixing spelling issues.

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

language-overridable - Resource settings that can be overridable at a language level.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

</dl>

---


### `cSpell.logFile`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.logFile` -- Write Logs to a File

</dd>

<dt>
Description
</dt>
<dd>

Have the logs written to a file instead of to VS Code.

</dd>

<dt>
Type
</dt>
<dd>

`string`

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_- none -_

</dd>

</dl>

---


### `cSpell.logLevel`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.logLevel` -- Set Logging Level

</dd>

<dt>
Description
</dt>
<dd>

Set the Debug Level for logging messages.

</dd>

<dt>
Type
</dt>
<dd>

`( "None" | "Error" | "Warning" | "Information" | "Debug" )`
| Value | Description |
| ----- | ----------- |
| `None` | Do not log |
| `Error` | Log only errors |
| `Warning` | Log errors and warnings |
| `Information` | Log errors, warnings, and info |
| `Debug` | Log everything (noisy) |

</dd>

<dt>
Scope
</dt>
<dd>

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_`"Error"`_

</dd>

</dl>

---


### `cSpell.trustedWorkspace`

<dl>

<dt>
Name
</dt>
<dd>

`cSpell.trustedWorkspace`

</dd>

<dt>
Description
</dt>
<dd>

Enable loading JavaScript CSpell configuration files.

This setting is automatically set to `true` in a trusted workspace. It is possible to override the setting to `false` in a trusted workspace,
but a setting of `true` in an untrusted workspace will be ignored.

See:
- [Visual Studio Code Workspace Trust security](https://code.visualstudio.com/docs/editor/workspace-trust)
- [Workspace Trust Extension Guide -- Visual Studio Code Extension API](https://code.visualstudio.com/api/extension-guides/workspace-trust)

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

window - Windows (instance) specific settings which can be configured in user, workspace, or remote settings.

</dd>

<dt>
Default
</dt>
<dd>

_`true`_

</dd>

<dt>
Since Extension Version
</dt>
<dd>

4.0.0

</dd>

</dl>

---



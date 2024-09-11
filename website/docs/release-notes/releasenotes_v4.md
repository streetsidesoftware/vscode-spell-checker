---
title: Release Notes v4.0
id: release-notes-v4.0
---

# Version 4.0.0 - Prerelease

## Highlights

-   Upgrade to CSpell 8.
-   Custom Decorators.
-   Spelling issues moved to their own Panel.
-   Word Trace mode to find dictionaries.
-   CSpell REPL
-   Hide spelling issues while typing.
-   Toggle showing spelling issues.

## Manual Installation

-   Download `code-spell-checker-*.vsix` from [VS Code Spell Checker Releases](https://github.com/streetsidesoftware/vscode-spell-checker/releases)
-   From VS Code Install from VSIX `code-spell-checker-4.0.0.vsix`
    ![image](https://user-images.githubusercontent.com/3740137/120071300-f0a27600-c08e-11eb-9828-155be0405510.png)

## Features

## Change Log

-   Support Virtual Workspaces ([#2971](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2971)) ([99c37d1](https://github.com/streetsidesoftware/vscode-spell-checker/commit/99c37d1178844175f27ae44917573a2307dc6ce8))
-   Enable workspace trust ([#2993](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2993)) ([15fe163](https://github.com/streetsidesoftware/vscode-spell-checker/commit/15fe16369b1e241ae49dc7758415b3a9982bcf08))
-   Support Word Tracing ([#2987](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2987)) ([001645b](https://github.com/streetsidesoftware/vscode-spell-checker/commit/001645beda5dc9bfa2f0b53f8a26d51a65f4a748))
-   Support loading local cspell dictionaries ([#2955](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2955)) ([d0ed69d](https://github.com/streetsidesoftware/vscode-spell-checker/commit/d0ed69db086c2db34e5483873ba1430327e9208a))
-   support custom decorators ([#2887](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2887)) ([d179d2e](https://github.com/streetsidesoftware/vscode-spell-checker/commit/d179d2e4cd0731bb1a2ebf627caf14b8d7c21edc))
-   Add command to autofix spelling issues. ([#2906](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2906)) ([356fae5](https://github.com/streetsidesoftware/vscode-spell-checker/commit/356fae553b255a1d71d58c1e62912e4fa12d789a))
-   Enable support for [Live Share](https://code.visualstudio.com/learn/collaboration/live-share) by adding `vsls` to the list of supported schemes. ([76e1583](https://github.com/streetsidesoftware/vscode-spell-checker/commit/76e1583e8e6f2c7cdc0e0211074da565bf3f0e52))
-   CSpell REPL ([#3109](https://github.com/streetsidesoftware/vscode-spell-checker/issues/3109)) ([5047a1d](https://github.com/streetsidesoftware/vscode-spell-checker/commit/5047a1d71588af64f30b880349aa2db31aa19d0a))
-   Hide spelling issues while typing. ([#3233](https://github.com/streetsidesoftware/vscode-spell-checker/issues/3233)) ([fbd5134](https://github.com/streetsidesoftware/vscode-spell-checker/commit/fbd513486f6bf4a0e17f40932b0cca8b4481b757))
-   Simplify file type and scheme settings ([#3244](https://github.com/streetsidesoftware/vscode-spell-checker/issues/3244)) ([151e7bf](https://github.com/streetsidesoftware/vscode-spell-checker/commit/151e7bf29909c4257966f820a99bc89e4810961e))

# Fixes

-   reduce reloading when opening a cspell config ([#2986](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2986)) ([a8a1e18](https://github.com/streetsidesoftware/vscode-spell-checker/commit/a8a1e1810b550d966c157d093ed50625244f3340))
-   Add link to suggestions ([#2888](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2888)) ([eff9c8c](https://github.com/streetsidesoftware/vscode-spell-checker/commit/eff9c8cadb3ce4cc62a4dd140ae3e79e8495bae5))
-   Add suggestions to hover ([#2896](https://github.com/streetsidesoftware/vscode-spell-checker/issues/2896)) ([cf88324](https://github.com/streetsidesoftware/vscode-spell-checker/commit/cf8832486f8d768a8a5d24a9c1dfda721ce02dac))

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [1.9.0-alpha.5](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.9.0-alpha.4...v1.9.0-alpha.5) (2020-05-17)


### Bug Fixes

* Adjust the workspace resolver paths ([#494](https://github.com/streetsidesoftware/vscode-spell-checker/issues/494)) ([fee200c](https://github.com/streetsidesoftware/vscode-spell-checker/commit/fee200c3d0fda15694707e397388c8888dd56dde))
* Update cspell-lib and other packages ([#492](https://github.com/streetsidesoftware/vscode-spell-checker/issues/492)) ([426b0da](https://github.com/streetsidesoftware/vscode-spell-checker/commit/426b0da60c4a8f2fcc0fca82f986f858e9524885))





# [1.9.0-alpha.2](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.9.0-alpha.1...v1.9.0-alpha.2) (2020-05-14)


### Bug Fixes

* Resolve Custom Dictionary path ([#487](https://github.com/streetsidesoftware/vscode-spell-checker/issues/487)) ([e99481d](https://github.com/streetsidesoftware/vscode-spell-checker/commit/e99481d99fed0a147768c592c22ec767c57115c6))





# [1.9.0-alpha.1](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.9.0-alpha.0...v1.9.0-alpha.1) (2020-05-11)


### Bug Fixes

* Make sure Custom Dictionaries use workspaceRoot ([#485](https://github.com/streetsidesoftware/vscode-spell-checker/issues/485)) ([70a375a](https://github.com/streetsidesoftware/vscode-spell-checker/commit/70a375a8305d2a30ab67439930e04ba0f1a7b41f))





# [1.9.0-alpha.0](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.8.1-alpha.0...v1.9.0-alpha.0) (2020-05-09)


### Bug Fixes

* Make sure to listen for all settings changes. ([#484](https://github.com/streetsidesoftware/vscode-spell-checker/issues/484)) ([ffd9a97](https://github.com/streetsidesoftware/vscode-spell-checker/commit/ffd9a97a6119186d1fdedbfe89d08bd78ab09788))


### Features

* Custom Dictionaries ([#482](https://github.com/streetsidesoftware/vscode-spell-checker/issues/482)) ([075ec87](https://github.com/streetsidesoftware/vscode-spell-checker/commit/075ec875fab13a6912529c067c0f85e2ba3f5e67))





## [1.8.1-alpha.0](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.8.0...v1.8.1-alpha.0) (2020-05-02)

**Note:** Version bump only for package vscode-spell-checker-server





# [1.8.0](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.8.0-alpha.2...v1.8.0) (2020-02-23)

**Note:** Version bump only for package vscode-spell-checker-server





# [1.8.0-alpha.2](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.8.0-alpha.1...v1.8.0-alpha.2) (2020-02-23)


### Bug Fixes

* get the latest cspell library and schema ([#440](https://github.com/streetsidesoftware/vscode-spell-checker/issues/440)) ([4bcff60](https://github.com/streetsidesoftware/vscode-spell-checker/commit/4bcff6013edd742af7a920ddd0703a66b703cf30))





# [1.8.0-alpha.1](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.8.0-alpha.0...v1.8.0-alpha.1) (2020-02-22)


### Features

* Support enableFileTypes ([#439](https://github.com/streetsidesoftware/vscode-spell-checker/issues/439)) ([2fde3bc](https://github.com/streetsidesoftware/vscode-spell-checker/commit/2fde3bc5c658ee51da5a56580aa1370bf8174070))





# [1.8.0-alpha.0](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.24...v1.8.0-alpha.0) (2020-02-21)


### Bug Fixes

* Upgrade to vscode-languageserver 6 ([2ec3ffa](https://github.com/streetsidesoftware/vscode-spell-checker/commit/2ec3ffaa96779abb3ea380f4a6d074228e560429))
* Use fsPath when working with files ([808538f](https://github.com/streetsidesoftware/vscode-spell-checker/commit/808538feacce6f2d5b218c1752f9bbfbf3d20b2c))

### Features

* Support `${workspaceFolder}` substitution ([6d1dfbc](https://github.com/streetsidesoftware/vscode-spell-checker/commit/6d1dfbcb007875100adb897447bf1690e90ef1f1))


## [1.7.24](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.24-alpha.1...v1.7.24) (2020-02-19)


### Bug Fixes

* Only evaluate CodeActions that are for `cspell` ([88a6095](https://github.com/streetsidesoftware/vscode-spell-checker/commit/88a6095ad980da52a65675341ac60c4ac33732ad))
* Update cspell and other packages ([2a12c03](https://github.com/streetsidesoftware/vscode-spell-checker/commit/2a12c03f88babf9ba38a76b2ab5e54215f9436af))


## [1.7.24-alpha.0](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.23...v1.7.24-alpha.0) (2020-02-18)


### Bug Fixes

* Try to detect some common bad regex patterns and fix them. ([822da97](https://github.com/streetsidesoftware/vscode-spell-checker/commit/822da97449e90b4dc4da3a3cf14611215ee05e09))





## [1.7.23](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.23-alpha.2...v1.7.23) (2020-02-15)

**Note:** Version bump only for package vscode-spell-checker-server





## [1.7.23-alpha.2](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.23-alpha.1...v1.7.23-alpha.2) (2020-02-15)


### Bug Fixes

* clean up CodeAction logging to reduce noise ([136a0e2](https://github.com/streetsidesoftware/vscode-spell-checker/commit/136a0e24f7c0517b5c3abf8ecb29f63d05fa1f29))





## [1.7.23-alpha.1](https://github.com/streetsidesoftware/vscode-spell-checker/compare/v1.7.23-alpha.0...v1.7.23-alpha.1) (2020-02-09)


### Bug Fixes

* fix lint issues in _server, client, and _settingsViewer ([bc4fb44](https://github.com/streetsidesoftware/vscode-spell-checker/commit/bc4fb44e948e1e6453fc222140642f573b8d7731))

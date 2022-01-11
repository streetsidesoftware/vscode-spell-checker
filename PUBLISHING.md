# Publishing the Extension

This file contains the steps to publish the extension.

It assumes that the `main` branch is stable.

Use the following steps:

1. Run [Action - Tag Version for Release](https://github.com/streetsidesoftware/vscode-spell-checker/actions/workflows/version-release.yml).

    This will update the `package.json:version` and push the tags to GitHub. (~5 min)

1. Open [Releases](https://github.com/streetsidesoftware/vscode-spell-checker/releases) and edit the draft release.

    Mark it as a `pre-release`:

    ![image](https://user-images.githubusercontent.com/3740137/148989954-55aed1bc-73b5-4445-873f-0cf13c757c6d.png)

1. Once the `pre-release` is created, the extension `.vsix` file will be generated and added to the release. (~5 min)
   ![image](https://user-images.githubusercontent.com/3740137/148990694-3707d1e0-dbbb-4098-bcbd-735cae5e8bc1.png)

1. Download the `code-spell-checker-*.vsix` file and test it out in VS Code. If it works as expected, update the release and remove the `This is a pre-release` check.

1. Manually Publish to the Marketplace: [Action Manual Publish](https://github.com/streetsidesoftware/vscode-spell-checker/actions/workflows/manual-publish.yml)

    Enter the release tag from the previous step. Looks like `v2.1.3`.

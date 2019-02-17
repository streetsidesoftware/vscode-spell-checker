/**
 * Exposes the Visual Studio Code extension API to the Jest testing environment.
 *
 * Tests would otherwise not have access because they are sandboxed.
 * This is a modification of [Unibeautify/vscode](https://github.com/Unibeautify/vscode/blob/ec013cdf3e1c/test)
 *
 * @see jest-vscode-framework-setup.ts
 */
const NodeEnvironment = require("jest-environment-node");
import * as vscode from "vscode";

class VsCodeEnvironment extends NodeEnvironment {
  constructor(config: any) {
    super(config);
  }

  public async setup() {
    await super.setup();
    this.global.vscode = vscode;
  }

  public async teardown() {
    this.global.vscode = {};
    await super.teardown();
  }
}

module.exports = VsCodeEnvironment;

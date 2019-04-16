/**
 * Takes the Visual Studio Code extension API which was exposed on the sandbox's
 * global object and uses it to create a virtual mock. This replaces vscode
 * module imports with the vscode extension instance from the test runner's
 * environment.
 *
 * This is a modification of [Unibeautify/vscode](https://github.com/Unibeautify/vscode/blob/ec013cdf3e1c/test)
 *
 * @see jest-vscode-environment.ts
 */
jest.mock("vscode", () => (<any>global)['vscode'], { virtual: true });

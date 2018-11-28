
interface VsCodeWebviewAPI {
  postMessage(msg: any): void;
}

declare function acquireVsCodeApi(): VsCodeWebviewAPI;

let vscode: VsCodeWebviewAPI | undefined;

export function getVSCodeAPI(): VsCodeWebviewAPI {
  vscode = vscode || acquireAPI();
  return vscode;
}

function acquireAPI(): VsCodeWebviewAPI {
  try {
    return acquireVsCodeApi();
  } catch (e) {
    if (!(e instanceof ReferenceError)) {
      throw e;
    }
  }
  return simulatedAPI;
}

const simulatedAPI: VsCodeWebviewAPI = {
  postMessage(msg: any) {
    window.parent.postMessage(msg, window.origin);
  }
};

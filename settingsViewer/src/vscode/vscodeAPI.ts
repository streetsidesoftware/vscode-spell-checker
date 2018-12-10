interface VsCodeWebviewAPI extends BroadcastChannel {}

declare function acquireVsCodeApi(): VsCodeWebviewAPI;

let vscode: VsCodeWebviewAPI | undefined;

export const channelName = 'settingsViewer';

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
  return new BroadcastChannel(channelName);
}

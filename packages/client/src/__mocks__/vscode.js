// __mocks__/vscode.js

// eslint-disable-next-line @typescript-eslint/no-var-requires
const vscodeUri =  require('vscode-uri');
jest.mock('vscode-uri');

const languages = {
  createDiagnosticCollection: jest.fn()
};

const StatusBarAlignment = {};

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn()
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn()
};

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  onDidSaveTextDocument: jest.fn(),
  getWorkspaceFolder: jest.fn(),
};

const OverviewRulerLane = {
  Left: null
};

const Uri = vscodeUri.URI;
const Range = jest.fn();
const Diagnostic = jest.fn();
const DiagnosticSeverity = { Error: 0, Warning: 1, Information: 2, Hint: 3 };

const debug = {
  onDidTerminateDebugSession: jest.fn(),
  startDebugging: jest.fn()
};

const commands = {
  executeCommand: jest.fn()
};

class Disposable {
  constructor (fn) {
    this.fn = fn;
  }
  dispose() {
    this.fn();
  }
  static from(...disposables) {
    return new Disposable(() => {
      for (const d of disposables) {
        d.dispose();
      }
    });
  }
}

const vscode = {
  languages,
  StatusBarAlignment,
  window,
  workspace,
  OverviewRulerLane,
  Uri,
  Range,
  Diagnostic,
  DiagnosticSeverity,
  Disposable,
  debug,
  commands
};

module.exports = vscode;

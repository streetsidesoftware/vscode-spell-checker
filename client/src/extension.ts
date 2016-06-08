import * as path from 'path';

import { workspace, Disposable, ExtensionContext, commands, window } from 'vscode';
import {
	LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind,
	TextEdit, Protocol2Code
} from 'vscode-languageclient';


const CONFIG_FILE = workspace.rootPath + "/.vscode/code_spell.json";

interface CSpellSettings {
    enabledLanguageIds: string[];
    ignorePaths?: string[];
    maxNumberOfProblems?: number;
    words?: string[];
    userWords?: string[];
    minWordLength?: number;
}

export function activate(context: ExtensionContext) {

	// The server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('server', 'src', 'server.js'));
	// The debug options for the server
	const debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

	// If the extension is launched in debug mode the debug server options are use
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run : { module: serverModule, transport: TransportKind.ipc },
		debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
	}

	const settings: CSpellSettings = workspace.getConfiguration().get('cSpell') as CSpellSettings;

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: settings.enabledLanguageIds,
		synchronize: {
			// Synchronize the setting section 'spellChecker' to the server
			configurationSection: 'cSpell',
			// Notify the server about file changes to '.clientrc files contain in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	}

	// Create the language client and start the client.
	const client = new LanguageClient('Code Spell Checker', serverOptions, clientOptions).start();


	function applyTextEdits(uri: string, documentVersion: number, edits: TextEdit[]) {
		const textEditor = window.activeTextEditor;
		if (textEditor && textEditor.document.uri.toString() === uri) {
			if (textEditor.document.version !== documentVersion) {
				window.showInformationMessage(`Spelling changes are outdated and cannot be applied to the document.`);
			}
			textEditor.edit(mutator => {
				for (const edit of edits) {
					mutator.replace(Protocol2Code.asRange(edit.range), edit.newText);
				}
			}).then((success) => {
				if (!success) {
					window.showErrorMessage('Failed to apply spelling changes to the document.');
				}
			});
		}
	}

	// Push the disposable to the context's subscriptions so that the
	// client can be deactivated on extension deactivation
	context.subscriptions.push(
		client,
		// commands.registerCommand('cSpell.editText', applyTextEdits)
		commands.registerCommand('cSpell.editText', applyTextEdits)
	);
}

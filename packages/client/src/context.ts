import { commands, TextDocument } from 'vscode';
import { CSpellClient } from './client';
import { extensionId } from './constants';
import { getCSpellDiags } from './diags';
import { ConfigKind, ConfigScope, ConfigTarget } from './server';

const prefix = extensionId;

type ContextValue = string | number | boolean | { [property: string]: ContextValue };

interface DocumentContext extends Record<string, ContextValue> {
    /** Indicates that a cspell config file is available */
    usesConfigFile: boolean;
    /** Indicates that a custom dictionary is available */
    usesCustomDictionary: boolean;
    /** Indicates that spelling issues were found */
    hasIssues: boolean;
    /** Indicate that the option to create a config file should be shown */
    showCreateConfig: boolean;
    /** Indicate that the option to create a dictionary should be shown */
    showCreateDictionary: boolean;
}

interface EditorMenuContext extends Record<string, ContextValue> {
    addWordToFolderDictionary: boolean;
    addWordToWorkspaceDictionary: boolean;
    addWordToUserDictionary: boolean;
    addWordToFolderSettings: boolean;
    addWordToWorkspaceSettings: boolean;
    addWordToUserSettings: boolean;
    addWordToDictionary: boolean;
    addWordToCSpellConfig: boolean;
    addIssuesToDictionary: boolean;
    createCustomDictionary: boolean;
    createCSpellConfig: boolean;
    addIgnoreWord: boolean;
}

export interface ContextTypes extends Record<string, ContextValue> {
    documentConfigContext: DocumentContext;
    editorMenuContext: EditorMenuContext;
}

function* flatten(key: string, value: ContextValue): Generator<[key: string, value: string | boolean | number]> {
    if (typeof value !== 'object') {
        yield [key, value];
    }
    for (const [k, v] of Object.entries(value)) {
        yield* flatten(`${key}.${k}`, v);
    }
}

const currentContext = new Map<string, string | boolean | number>();
const defaultDocumentConfigContext: DocumentContext = Object.freeze({
    usesConfigFile: false,
    usesCustomDictionary: false,
    hasIssues: false,
    showCreateConfig: false,
    showCreateDictionary: false,
});

const defaultEditorMenuContext: EditorMenuContext = Object.freeze({
    addWordToFolderDictionary: false,
    addWordToWorkspaceDictionary: false,
    addWordToUserDictionary: false,
    addWordToFolderSettings: false,
    addWordToWorkspaceSettings: false,
    addWordToUserSettings: false,
    addWordToDictionary: false,
    addWordToCSpellConfig: false,
    addIssuesToDictionary: false,
    createCustomDictionary: false,
    createCSpellConfig: false,
    addIgnoreWord: false,
});

/**
 * Set context values
 * @param name - name of context to set
 * @param value - object containing key / values pairs to set
 * @returns resolves on success.
 */
async function setContext(context: ContextTypes): Promise<void> {
    const kvpValues = [...flatten(prefix, context)];
    const filteredKvpValues = kvpValues.filter(([k, v]) => v !== currentContext.get(k));

    const calls = filteredKvpValues.map(([k, v]) => commands.executeCommand('setContext', k, v));

    filteredKvpValues.forEach(([k, v]) => currentContext.set(k, v));
    // console.log(
    //     'Set Context %o',
    //     filteredKvpValues.map(([k]) => k)
    // );

    await Promise.all(calls);
}

/**
 * Update any menu related context values because the active document changed.
 * @param client - used to fetch the configuration.
 * @param doc - the new active document or undefined
 * @returns resolves on success.
 */
export async function updateDocumentRelatedContext(client: CSpellClient, doc: TextDocument | undefined): Promise<void> {
    const context: ContextTypes = {
        documentConfigContext: { ...defaultDocumentConfigContext },
        editorMenuContext: { ...defaultEditorMenuContext },
    };

    if (!doc) {
        await setContext(context);
        return;
    }

    const pCfg = client.getConfigurationForDocument(doc);
    const diag = getCSpellDiags(doc.uri);
    const cfg = await pCfg;

    const { agg, matrix } = calcTargetAggregates(cfg.configTargets);
    const workspaceDicts = (agg.dictionary || 0) - (matrix.dictionary.user || 0);

    const usesConfigFile = !!agg.cspell;
    const usesCustomDictionary = workspaceDicts > 0;
    const hasIssues = diag.length > 0;
    const hasMultipleIssues = diag.length > 1;
    const showCreateConfig = !agg.cspell;
    const showCreateDictionary = !usesCustomDictionary;

    const showWorkspace = !!matrix.vscode.workspace;
    const showFolder = !!matrix.vscode.folder;

    context.documentConfigContext = {
        usesConfigFile,
        usesCustomDictionary,
        hasIssues,
        showCreateConfig,
        showCreateDictionary,
    };

    const show = !!cfg.settings?.showCommandsInEditorContextMenu;

    context.editorMenuContext.addWordToFolderDictionary = show && hasIssues && !!matrix.dictionary.folder;
    context.editorMenuContext.addWordToWorkspaceDictionary = show && hasIssues && !!matrix.dictionary.workspace;
    context.editorMenuContext.addWordToUserDictionary = show && hasIssues && !!matrix.dictionary.user;

    context.editorMenuContext.addWordToFolderSettings = show && hasIssues && showFolder;
    context.editorMenuContext.addWordToWorkspaceSettings = show && hasIssues && showWorkspace;
    context.editorMenuContext.addWordToUserSettings = show && hasIssues && !matrix.dictionary.user;

    context.editorMenuContext.addWordToDictionary = show && hasIssues && !!matrix.dictionary.unknown;
    context.editorMenuContext.addWordToCSpellConfig = show && hasIssues && usesConfigFile && !usesCustomDictionary;
    context.editorMenuContext.addIssuesToDictionary = show && hasIssues && hasMultipleIssues;
    context.editorMenuContext.createCustomDictionary = show && showCreateDictionary;
    context.editorMenuContext.createCSpellConfig = show && !usesConfigFile;
    context.editorMenuContext.addIgnoreWord = show && hasIssues;

    await setContext(context);
    return;
}

type ConfigTargetKindAndScope = ConfigKind | ConfigScope;

type ConfigAggregates = {
    [key in ConfigTargetKindAndScope]?: number;
};

type ConfigScopeCnt = {
    [key in ConfigScope]?: number;
};

type ConfigMatrix = {
    [key in ConfigKind]: ConfigScopeCnt;
};

function calcTargetAggregates(configTargets: ConfigTarget[]): { agg: ConfigAggregates; matrix: ConfigMatrix } {
    const agg: ConfigAggregates = {};
    const matrix: ConfigMatrix = {
        vscode: {},
        cspell: {},
        dictionary: {},
    };

    for (const t of configTargets) {
        agg[t.kind] = (agg[t.kind] || 0) + 1;
        agg[t.scope] = (agg[t.scope] || 0) + 1;
        matrix[t.kind][t.scope] = (matrix[t.kind][t.scope] || 0) + 1;
    }

    return { agg, matrix };
}

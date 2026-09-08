/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
/**
 * This file contains TypeScript interfaces for VS Code extension contributions.
 * VS Code does not currently publish TypeScript interfaces for extension contributions.
 * These interfaces are based on the VS Code codebase.
 *
 * This file is based upon the VS Code codebase, specifically the extensions.ts file:
 * https://github.com/microsoft/vscode/blob/0a1b6b1d9febe5f0ca4943625cc05162411fee97/src/vs/platform/extensions/common/extensions.ts
 *
 */

import type { Icon, ILocalizedString, WhenClause } from './typesBase.js';

// cspell:ignore IJSON

export interface ICommand {
    command: string;
    title: string | ILocalizedString;
    category?: string | ILocalizedString;

    // Additional properties for the command can be added here.
    shortTitle?: string | ILocalizedString;
    icon?: Icon;
    enablement?: WhenClause;
}

export interface IDebugger {
    label?: string;
    type: string;
    runtime?: string;
}

export interface IGrammar {
    language?: string;
}

export interface IJSONValidation {
    fileMatch: string | string[];
    url: string;
}

export interface IJSONValidationRegistry {
    url: string;
}

export interface IKeyBinding {
    command: string;
    key: string;
    when?: string;
    mac?: string;
    linux?: string;
    win?: string;
}

export interface ILanguage {
    id: string;
    extensions: string[];
    aliases?: string[];
}

export interface IMenuItem {
    command: string;
    alt?: string;
    when?: string;
    group?: string;
    order?: number;
}

export interface IMenuSubmenuItem {
    submenu: string;
    when?: string;
    group?: string;
    order?: number;
}

export type IMenuEntry = IMenuItem | IMenuSubmenuItem;

/**
 * Submenu attributes for VS Code menus.
 */
export interface ISubmenu {
    /**
     * The unique identifier for the submenu.
     * Must match {@link IMenuSubmenuItem.submenu}
     */
    id: string;
    label: string;
}

export interface ISnippet {
    language: string;
}

export interface ITheme {
    label: string;
}

export interface IViewContainer {
    id: string;
    title: string;
    contextualTitle?: string;
    icon: Icon;
}

export interface IViewWelcome {
    view: string;
    contents: string;
    when?: string;
}

export interface IView {
    id: string;
    name: string;
    icon: Icon;
    contextualTitle?: string;
    type?: 'tree' | 'webview';
    when?: string;
    initialSize?: number;
    visibility?: 'visible' | 'hidden';
}

export interface IColor {
    id: string;
    description: string;
    defaults: { light: string; dark: string; highContrast: string };
}

export interface ICodeActionContributionAction {
    readonly kind: string;
    readonly title: string;
    readonly description?: string;
}

export interface ICodeActionContribution {
    readonly languages: readonly string[];
    readonly actions: readonly ICodeActionContributionAction[];
}

export interface IAuthenticationContribution {
    readonly id: string;
    readonly label: string;
    readonly authorizationServerGlobs?: string[];
}

export interface IWalkthroughStep {
    readonly id: string;
    readonly title: string;
    readonly description: string | undefined;
    readonly media:
        | { image: string | { dark: string; light: string; hc: string }; altText: string; markdown?: never; svg?: never; video?: never }
        | { markdown: string; image?: never; svg?: never; video?: never }
        | { svg: string; altText: string; markdown?: never; image?: never; video?: never }
        | {
              video: string | { dark: string; light: string; hc: string };
              poster: string | { dark: string; light: string; hc: string };
              altText: string;
              markdown?: never;
              image?: never;
              svg?: never;
          };
    readonly completionEvents?: string[];
    /** @deprecated use `completionEvents: 'onCommand:...'` */
    readonly doneOn?: { command: string };
    readonly when?: string;
}

export interface IWalkthrough {
    readonly id: string;
    readonly title: string;
    readonly icon?: string;
    readonly description: string;
    readonly steps: IWalkthroughStep[];
    readonly featuredFor: string[] | undefined;
    readonly when?: string;
}

export interface IStartEntry {
    readonly title: string;
    readonly description: string;
    readonly command: string;
    readonly when?: string;
    readonly category: 'file' | 'folder' | 'notebook';
}

export interface INotebookEntry {
    readonly type: string;
    readonly displayName: string;
}

export interface INotebookRendererContribution {
    readonly id: string;
    readonly displayName: string;
    readonly mimeTypes: string[];
}

export interface IDebugVisualizationContribution {
    readonly id: string;
    readonly when: string;
}

export interface ITranslation {
    id: string;
    path: string;
}

export interface ILocalizationContribution {
    languageId: string;
    languageName?: string;
    localizedLanguageName?: string;
    translations: ITranslation[];
    minimalTranslations?: { [key: string]: string };
}

export interface IChatParticipantContribution {
    id: string;
    name: string;
    fullName: string;
    description?: string;
    isDefault?: boolean;
    commands?: { name: string }[];
}

export interface IToolContribution {
    name: string;
    displayName: string;
    modelDescription: string;
    userDescription?: string;
}

export interface IToolSetContribution {
    name: string;
    referenceName: string;
    description: string;
    icon?: string;
    tools: string[];
}

export interface IMcpCollectionContribution {
    readonly id: string;
    readonly label: string;
    readonly when?: string;
}

export interface IChatFileContribution {
    readonly path: string;
    readonly name?: string;
    readonly description?: string;
    readonly when?: string;
    readonly sessionTypes?: readonly string[];
}

export interface IConfigurationDefault {
    [key: string]: unknown;
}

export interface IConfigurationDefaults {
    [languageId: string]: IConfigurationDefault;
}

type JSONSchemaItem = unknown;

export interface Menus {
    [context: string]: IMenuEntry[];
}

export interface ViewContainers {
    [location: string]: IViewContainer[];
}

export interface Views {
    [location: string]: IView[];
}

export interface CustomIcon {
    description: string;
    default: string;
}

export interface IExtensionContributions {
    authentication?: IAuthenticationContribution[];
    colors?: IColor[];
    commands?: ICommand[];
    configuration?: JSONSchemaItem[];
    configurationDefaults?: IConfigurationDefaults;
    debuggers?: IDebugger[];
    grammars?: IGrammar[];
    icons?: { [key: string]: CustomIcon };
    iconThemes?: ITheme[];
    jsonValidation?: IJSONValidation[];
    jsonValidationRegistry?: IJSONValidationRegistry[];
    keybindings?: IKeyBinding[];
    languages?: ILanguage[];
    localizations?: ILocalizationContribution[];
    menus?: Menus;
    productIconThemes?: ITheme[];
    snippets?: ISnippet[];
    startEntries?: IStartEntry[];
    submenus?: ISubmenu[];
    terminal?: ITerminalContribution;
    themes?: ITheme[];
    views?: Views;
    viewsContainers?: ViewContainers;
    viewsWelcome?: IViewWelcome[];
    walkthroughs?: IWalkthrough[];
}

export interface IExtensionCapabilities {
    readonly virtualWorkspaces?: ExtensionVirtualWorkspaceSupport;
    readonly untrustedWorkspaces?: ExtensionUntrustedWorkspaceSupport;
    readonly agentsWindow?: { readonly supported: boolean };
}

export type ExtensionKind = 'ui' | 'workspace' | 'web';

export type LimitedWorkspaceSupportType = 'limited';
export type ExtensionUntrustedWorkspaceSupportType = boolean | LimitedWorkspaceSupportType;
export type ExtensionUntrustedWorkspaceSupport =
    | { supported: true }
    | { supported: false; description: string }
    | { supported: LimitedWorkspaceSupportType; description: string; restrictedConfigurations?: string[] };

export type ExtensionVirtualWorkspaceSupportType = boolean | LimitedWorkspaceSupportType;
export type ExtensionVirtualWorkspaceSupport =
    boolean | { supported: true } | { supported: false | LimitedWorkspaceSupportType; description: string };

export function getWorkspaceSupportTypeMessage(
    supportType: ExtensionUntrustedWorkspaceSupport | ExtensionVirtualWorkspaceSupport | undefined,
): string | undefined {
    if (typeof supportType === 'object' && supportType !== null) {
        if (supportType.supported !== true) {
            return supportType.description;
        }
    }
    return undefined;
}

export interface IExtensionIdentifier {
    id: string;
    uuid?: string;
}

export interface IRelaxedExtensionManifest {
    name: string;
    displayName?: string;
    publisher: string;
    version: string;
    engines: { readonly vscode: string };
    description?: string;
    main?: string;
    type?: string;
    browser?: string;
    preview?: boolean;
    // For now this only supports pointing to l10n bundle files
    // but it will be used for package.l10n.json files in the future
    l10n?: string;
    icon?: string;
    categories?: string[];
    keywords?: string[];
    activationEvents?: readonly string[];
    extensionDependencies?: string[];
    extensionAffinity?: string[];
    extensionPack?: string[];
    extensionKind?: ExtensionKind | ExtensionKind[];
    contributes?: IExtensionContributions;
    repository?: { url: string };
    bugs?: { url: string };
    originalEnabledApiProposals?: readonly string[];
    enabledApiProposals?: readonly string[];
    api?: string;
    scripts?: { [key: string]: string };
    capabilities?: IExtensionCapabilities;
}

export type IExtensionManifest = Readonly<IRelaxedExtensionManifest>;

export const enum ExtensionType {
    System,
    User,
}

export interface ITerminalContribution {
    /**
     * Defines additional terminal profiles that the user can create.
     */
    profiles?: ITerminalProfile[];

    /**
     * Defines terminal completion providers that will be registered when the extension activates.
     */
    completionProviders?: ITerminalCompletionProvider[];
}

export interface ITerminalProfile {
    /**
     * The ID of the terminal profile provider.
     */
    id: string;

    /**
     * Title for this terminal profile.
     */
    title: string;

    /**
     * A codicon, URI, or light and dark URIs to associate with this terminal type.
     */
    icon?: Icon;

    /**
     * A title template string for the terminal tab. Supports variables like ${sequence}, ${process}, ${cwd}, etc.
     * Overrides the default terminal.integrated.tabs.title setting for terminals created with this profile.
     */
    titleTemplate?: string;
}

export interface ITerminalCompletionProvider {
    /**
     * A description of what the completion provider does. This will be shown in the settings UI.
     */
    description?: string;
}

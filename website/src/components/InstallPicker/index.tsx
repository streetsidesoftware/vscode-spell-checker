import React, { useState } from 'react';
import styles from './styles.module.css';

const EXT = 'streetsidesoftware.code-spell-checker';

type Editor = {
    id: string;
    label: string;
    command: string;
    href: string;
    action: string;
    hint: string;
};

const EDITORS: Editor[] = [
    {
        id: 'vscode',
        label: 'VS Code',
        command: `code --install-extension ${EXT}`,
        href: `vscode:extension/${EXT}`,
        action: 'Install in VS Code',
        hint: 'Opens VS Code, or install from the Marketplace',
    },
    {
        id: 'insiders',
        label: 'Insiders',
        command: `code-insiders --install-extension ${EXT}`,
        href: `vscode-insiders:extension/${EXT}`,
        action: 'Install in Insiders',
        hint: 'Opens Visual Studio Code Insiders',
    },
    {
        id: 'cursor',
        label: 'Cursor',
        command: `cursor --install-extension ${EXT}`,
        href: `https://marketplace.visualstudio.com/items?itemName=${EXT}`,
        action: 'Open the extension page',
        hint: 'Or search for "code-spell-checker" in the Extensions view',
    },
    {
        id: 'vscodium',
        label: 'VSCodium',
        command: `codium --install-extension ${EXT}`,
        href: 'https://open-vsx.org/extension/streetsidesoftware/code-spell-checker',
        action: 'Get it on Open VSX',
        hint: 'Available from the Open VSX registry',
    },
    {
        id: 'web',
        label: 'vscode.dev',
        command: 'Install from the Extensions view',
        href: 'https://vscode.dev',
        action: 'Open vscode.dev',
        hint: 'Runs entirely in the browser',
    },
];

export default function InstallPicker(): React.ReactNode {
    const [id, setId] = useState(EDITORS[0].id);
    const [copied, setCopied] = useState(false);
    const current = EDITORS.find((e) => e.id === id) ?? EDITORS[0];

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(current.command);
        } catch {
            /* clipboard unavailable */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
    };

    return (
        <div className={styles.panel}>
            <p className={styles.label}>Installation</p>
            <div className={styles.tabs} role="tablist" aria-label="Editor">
                {EDITORS.map((e) => (
                    <button
                        key={e.id}
                        type="button"
                        role="tab"
                        aria-selected={e.id === id}
                        className={e.id === id ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                        onClick={() => {
                            setId(e.id);
                            setCopied(false);
                        }}
                    >
                        {e.label}
                    </button>
                ))}
            </div>
            <div className={styles.commandRow}>
                <code className={styles.command}>
                    <span aria-hidden="true" className={styles.prompt}>
                        $
                    </span>
                    {current.command}
                </code>
                <button type="button" className={styles.copy} onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <div className={styles.actions}>
                <a className={styles.install} href={current.href}>
                    {current.action}
                </a>
                <span className={styles.hint}>{current.hint}</span>
            </div>
        </div>
    );
}

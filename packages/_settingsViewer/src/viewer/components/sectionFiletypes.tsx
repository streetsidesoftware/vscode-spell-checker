import IconBlock from '@material-ui/icons/Block';
import IconCheck from '@material-ui/icons/Check';
import * as React from 'react';
import type { ConfigTarget } from 'webview-api';

import type { AppState } from '../AppState';
import { Chips, CsChip as Chip } from './primitives';

interface Props {
    appState: AppState;
    target: ConfigTarget;
}

const compare = new Intl.Collator().compare;

export function SectionFiletypes(props: Props): JSX.Element {
    function handleSelect(langId: string, selected: boolean) {
        const target = props.target;
        const config = props.appState.settings.configs[target];
        const enabled = config.languageIdsEnabled.includes(langId);
        if (enabled !== selected) {
            props.appState.actionEnableLanguageId(langId, selected, target);
        }
    }

    const appState = props.appState;
    const target = props.target;
    const config = appState.settings.configs[target];
    if (!config) {
        return <div></div>;
    }
    const setOfEnabledIds = new Set(config.languageIdsEnabled);
    const inherited = config.inherited.languageIdsEnabled;
    const note =
        inherited && inherited !== target ? <span style={{ fontSize: '0.65em', opacity: 0.75 }}>inherited from {inherited}</span> : '';
    const knownLanguageIds = appState.settings.knownLanguageIds.concat().sort(compare);
    return (
        <div>
            <h2>File Types and Programming Languages {note}</h2>
            <Chips>
                {knownLanguageIds.map((langId) => (
                    <Chip
                        variant={'default'}
                        icon={setOfEnabledIds.has(langId) ? <IconCheck /> : <IconBlock />}
                        key={langId}
                        id={langId}
                        label={langId}
                        onClick={() => handleSelect(langId, !setOfEnabledIds.has(langId))}
                        clickable
                    />
                ))}
            </Chips>
        </div>
    );
}

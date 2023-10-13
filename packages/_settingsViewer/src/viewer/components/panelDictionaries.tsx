import { observer } from 'mobx-react-lite';
import * as React from 'react';

import type { AppState } from '../AppState';
import { SectionDictionaries } from './sectionDictionaries';

export const PanelDictionaries = observer((props: { appState: AppState }) => {
    const dictionaries = props.appState.settings.dictionaries;
    return <SectionDictionaries dictionaries={dictionaries}></SectionDictionaries>;
});

import * as React from 'react';
import {observer} from 'mobx-react';
import {List, SimpleListItem} from '@rmwc/list';
import { DictionaryEntry } from '../../api/settings';


@observer
export class SectionDictionaries extends React.Component<{dictionaries: DictionaryEntry[]; sectionTitle?: string}, {}> {
    render() {
        const dictionaries = this.props.dictionaries;
        const title = this.props.sectionTitle || 'Dictionaries';
        return (
            <div>
                <h2>{title}</h2>
                <List twoLine className='dictionary_list'>
                    {dictionaries.map(dict => {
                        const hasLocales = dict.locales && dict.locales.length > 0;
                        const hasFileTypes = dict.languageIds && dict.languageIds.length > 0;
                        const icon = hasFileTypes
                            ? 'code'
                            : hasLocales ? 'import_contacts'
                            : 'select_all';
                        return
                        (<SimpleListItem key={dict.name}
                            graphic={icon}
                            text={dict.name}
                            secondaryText={dict.description}
                            meta={dict.locales.join(', ')}
                        />)
                    })}
                </List>
            </div>
        );
     }
}

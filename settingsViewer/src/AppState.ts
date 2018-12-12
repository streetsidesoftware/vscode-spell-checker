import {observable, computed} from 'mobx';
import { ConfigurationForDocument } from './settings/';

export const cats = [
    { title: 'Coding Cat', image: 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif', icon: 'home'},
    { title: 'Compiling Cat', image: 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif', icon: 'face'},
    { title: 'Testing Cat', image: 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', icon: 'favorite'},
];

export const tabLabels = ['Language'].concat(cats.map(cat => cat.title));

export class AppState {
    @observable activeTabIndex = 0;
    @observable timer = 0;
    @observable counter = 0;
    @observable config: ConfigurationForDocument = {
        languageEnabled: true,
        fileEnabled: true,
        settings: {},
        docSettings: {}
    };
    @computed get activeTab() {
        return tabLabels[this.activeTabIndex];
    }

    constructor() {
        setInterval(() => {
            this.timer += 1;
        }, 1000);
    }

    resetTimer() {
        this.timer = 0;
    }
}

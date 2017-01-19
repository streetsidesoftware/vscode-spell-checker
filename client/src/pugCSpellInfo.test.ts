import { expect } from 'chai';
import * as t from './pugCSpellInfo';

describe('Verify Template Renders', () => {
    it('Renders the template to html', () => {
        const html = t.render({
            filename: 'test.ts',
            fileEnabled: true,
            languageEnabled: true,
            languageId: 'typescript',
            spellingErrors: ['one', 'two', 'three'],
            linkEnableDisableLanguage: 'command:cSpell',
        });
        expect(html).to.not.be.empty;
        expect(html).to.contain('test.ts');
        expect(html).to.contain('<li>two</li>');
    });
    it('Renders the template to html again', () => {
        const html = t.render({
            filename: 'main.cpp',
            fileEnabled: true,
            languageEnabled: true,
            languageId: 'cpp',
            spellingErrors: ['one', 'two', 'three', '<code>'],
            linkEnableDisableLanguage: 'command:cSpell',
         });
        expect(html).to.not.be.empty;
        expect(html).to.contain('main.cpp');
        expect(html).to.not.contain('<code>');
        expect(html).to.contain('&lt;code&gt;');
    });
});
import type { Uri } from 'vscode';

import * as di from '../di.mjs';
import { colors } from './ansiUtils.mjs';

export async function cmdSuggestions(word: string, uri: Uri | string): Promise<string> {
    const client = di.get('client');

    const result = await client.serverApi.spellingSuggestions(word, { uri: uri.toString() });
    const suggestions = result.suggestions;

    const lines: string[] = [];

    lines.push(`Suggestions for "${word}":`);

    if (!suggestions) {
        lines.push(colors.yellow('  No suggestions'));
    }

    for (const suggestion of suggestions) {
        const sug = suggestion.isPreferred || suggestion.word === word ? colors.green(suggestion.word) : suggestion.word;
        lines.push(`  ${sug}${suggestion.isPreferred ? colors.yellow('*') : ''}`);
    }

    return lines.join('\n');
}

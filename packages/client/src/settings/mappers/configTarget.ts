import { toUri } from '../../util/uriHelper';
import { ConfigTarget, ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../../client';
import {
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from '../clientConfigTarget';

export function mapConfigTargetToClientConfigTarget(ct: ConfigTarget): ClientConfigTarget {
    switch (ct.kind) {
        case 'vscode':
            return mapConfigTargetVSCodeToClientConfigTargetVSCode(ct);
        case 'cspell':
            return mapConfigTargetCSpellToClientConfigTargetCSpell(ct);
        case 'dictionary':
            return mapConfigTargetDictionaryToClientConfigTargetDictionary(ct);
    }
}

function mapConfigTargetVSCodeToClientConfigTargetVSCode(ct: ConfigTargetVSCode): ClientConfigTargetVSCode {
    const { name, kind, scope, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
        configScope: undefined,
    };
}

function mapConfigTargetCSpellToClientConfigTargetCSpell(ct: ConfigTargetCSpell): ClientConfigTargetCSpell {
    const { name, kind, scope, configUri, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
        configUri: toUri(configUri),
    };
}

function mapConfigTargetDictionaryToClientConfigTargetDictionary(ct: ConfigTargetDictionary): ClientConfigTargetDictionary {
    const { name, kind, scope, dictionaryUri, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
        dictionaryUri: toUri(dictionaryUri),
    };
}

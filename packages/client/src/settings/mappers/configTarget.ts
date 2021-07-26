import { toUri } from '../../../../__utils/dist/uriHelper';
import { ConfigTarget, ConfigTargetCSpell, ConfigTargetDictionary, ConfigTargetVSCode } from '../../server';
import {
    ClientConfigTarget,
    ClientConfigTargetCSpell,
    ClientConfigTargetDictionary,
    ClientConfigTargetVSCode,
} from '../clientConfigTarget';

export function mapConfigTargetToClientConfigTarget(ct: ConfigTarget): ClientConfigTarget {
    switch (ct.kind) {
        case 'vscode':
            return mapConfigTargetVSCodeToClinetConfigTargetVSCode(ct);
        case 'cspell':
            return mapConfigTargetCSpellToClinetConfigTargetCSpell(ct);
        case 'dictionary':
            return mapConfigTargetDictionaryToClinetConfigTargetDictionary(ct);
    }
}

function mapConfigTargetVSCodeToClinetConfigTargetVSCode(ct: ConfigTargetVSCode): ClientConfigTargetVSCode {
    const { name, kind, scope, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
    };
}

function mapConfigTargetCSpellToClinetConfigTargetCSpell(ct: ConfigTargetCSpell): ClientConfigTargetCSpell {
    const { name, kind, scope, configUri, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
        configUri: toUri(configUri),
    };
}

function mapConfigTargetDictionaryToClinetConfigTargetDictionary(ct: ConfigTargetDictionary): ClientConfigTargetDictionary {
    const { name, kind, scope, dictionaryUri, docUri } = ct;
    return {
        name,
        kind,
        scope,
        docUri: toUri(docUri),
        dictionaryUri: toUri(dictionaryUri),
    };
}

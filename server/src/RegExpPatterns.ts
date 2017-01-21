// Exclude Expressions
// cSpell:ignore anrvtbf
export const regExMatchUrls = /(?:https?|ftp):\/\/\S+/gi;
export const regExHexDigits = /^x?[0-1a-f]+$/i;
export const regExMatchCommonHexFormats = /(?:#[0-9a-f]{3,8})|(?:0x[0-9a-f]+)|(?:\\u[0-9a-f]{4})|(?:\\x\{[0-9a-f]{4}\})/gi;
export const regExSpellingGuard = /(?:spell-?checker|cSpell)::?\s*disable\b(?:.|\s)*?(?:(?:spell-?checker|cSpell)::?\s*enable\b|$)/gi;
export const regExPublicKey = /BEGIN\s+PUBLIC\s+KEY(?:.|\s)+?END\s+PUBLIC\s+KEY/gi;
export const regExCert = /BEGIN\s+CERTIFICATE(?:.|\s)+?END\s+CERTIFICATE/gi;
export const regExEscapeCharacters = /\\(?:[anrvtbf]|[xu][a-f0-9]+)/gi;
export const regExBase64 = /(?:[a-z0-9\/+]{40,}\s*)+(?:[a-z0-9\/+]+=*)?/gi;

// Include Expressions
export const regExPhpHereDoc = /<<<['"]?(\w+)['"]?(?:.|\s)+?^\1;/gim;
export const regExString = /(?:(['"])(?:\\\\|(?:\\\1)|[^\1\n])+\1)|(?:([`])(?:\\\\|(?:\\\2)|[^\2])+\2)/gi;

// Note: the C Style Comments incorrectly considers '/*' and '//' inside of strings as comments.
export const regExCStyleComments = /(?:\/\/.*$)|(?:\/\*(?:.|\s)+?\*\/)/gim;

export const regExEmail = /<?[\w.\-+]+@\w+(\.\w+)+>?/gi;

export const regExRepeatedChar = /^(\w)\1{3,}$/;
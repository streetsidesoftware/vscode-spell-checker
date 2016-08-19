import minimatch = require('minimatch');

export class DictionaryAssociation {
    constructor(protected _progLangGlob: string, protected _spokenLang: string, protected _path: string) {}

    match(languageId: string, spokenLangPattern: string): boolean {
        return this.matchProgLang(languageId)
            && this.matchSpokenLang(spokenLangPattern);
    }

    /**
     * @param {string} languageId
     * @returns
     */
    matchProgLang(languageId: string) {
        return minimatch(languageId, this._progLangGlob);
    }

    /**
     * Match against a spokenLangPattern.  If this.spokenLang is null, it will match all patterns.
     *
     * @param {string} spokenLangPattern
     * @returns
     */
    matchSpokenLang(spokenLangPattern: string) {
        return !this._spokenLang || minimatch(this._spokenLang, spokenLangPattern);
    }

    get pathToDictionary() { return this._path; }
    get progLangGlob() { return this._progLangGlob; }
    get spokenLang() { return this._spokenLang; }
}

export type IconIdentifier = string;

export interface ThemeColor {
    id: string;
}

export interface ThemeIcon {
    readonly id: string;
    readonly color?: ThemeColor;
}

export type Categories = Readonly<{
    View: ILocalizedString;
    Help: ILocalizedString;
    Test: ILocalizedString;
    File: ILocalizedString;
    Preferences: ILocalizedString;
    Developer: ILocalizedString;
}>;

export interface ILocalizedString {
    /**
     * The localized value of the string.
     */
    value: string;

    /**
     * The original (non localized value of the string)
     */
    original: string;
}

type URI = string;

export type Icon = { dark?: URI; light?: URI } | ThemeIcon | IconIdentifier;

export type WhenClause = string;

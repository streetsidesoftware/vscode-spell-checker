export type Prefix<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : K]: T[K];
};

export type PrefixWithCspell<T> = Prefix<T, 'cSpell.'>;

export type PickAndFlattenInterface<T, K extends keyof T> = K extends string ? Prefix<T[K], `${K}.`> : never;

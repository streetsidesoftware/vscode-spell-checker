export const namedViews = ['todo', 'hello-world', 'cspell-info'] as const;

export type SupportedViews = (typeof namedViews)[number];

type RegisteredViews = {
    readonly [P in SupportedViews]: P;
};

export const supportedViewsByName = Object.freeze(Object.fromEntries(namedViews.map((name) => [name, name] as const)) as RegisteredViews);

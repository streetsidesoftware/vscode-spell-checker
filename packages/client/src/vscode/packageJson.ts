export interface PackageJson {
    name?: string;
    description?: string;
    version?: string;
    contributes?: Contributes;
}

interface Contributes {
    menus?: Menus;
    commands?: CommandItem[];
}

type MenuTypes = 'editor/context' | 'commandPalette' | 'view/item/context';

type Menus = {
    [key in MenuTypes]?: MenuItem[];
};

interface MenuItem {
    command: string;
    when?: string;
    group?: string;
}

interface CommandItem {
    command: string;
    category?: string;
    title?: string;
}

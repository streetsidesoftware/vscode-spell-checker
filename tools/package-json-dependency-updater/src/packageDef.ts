export interface PackageJson {
    name?: string;
    version?: string;
    description?: string;
    repository?: string;
    private?: boolean;
    type?: 'commonjs' | 'modules';
    dependencies?: Dependencies;
    devDependencies?: Dependencies;
    workspaces?: Workspaces;
}

export interface Dependencies {
    [key: string]: string;
}

export type Workspaces = string[] | WorkspacesDef;

export interface WorkspacesDef {
    packages: string[];
}

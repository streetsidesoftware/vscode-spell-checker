import rfdc from 'rfdc';
import { ConfigurationTarget } from './index';
import { createMockWorkspaceConfiguration, MockWorkspaceConfigurationData } from './WorkspaceConfiguration';

const clone = rfdc();

interface TestConfig {
    myExtension?: {
        name?: string;
        show?: boolean;
        values?: string[];
    };
    otherExtension?: {
        position?: 'above' | 'below';
        show?: boolean;
        enabled?: boolean;
        delay?: number;
    };
    jsonExtension?: {
        name?: string;
    };
}

describe('WorkspaceConfiguration', () => {
    test('createMockWorkspaceConfiguration', () => {
        const config = createMockWorkspaceConfiguration<TestConfig>();
        expect(config.get('myExtension.show')).toBe(undefined);
        expect(config.get('myExtension.name')).toBe(undefined);
    });

    test.each`
        key                         | expected
        ${''}                       | ${false}
        ${'myExtension'}            | ${true}
        ${'myExtension.show'}       | ${true}
        ${'myExtension.name'}       | ${true}
        ${'otherExtension.enabled'} | ${false}
    `('createMockWorkspaceConfiguration has $key', ({ key, expected }) => {
        const config = createMockWorkspaceConfiguration<TestConfig>(sampleConfigData());
        expect(config.has(key)).toBe(expected);
    });

    test.each`
        key                         | scope        | expected
        ${'myExtension.show'}       | ${undefined} | ${false}
        ${'myExtension.name'}       | ${undefined} | ${'workspace'}
        ${'myExtension.values'}     | ${undefined} | ${['workspace']}
        ${'otherExtension.enabled'} | ${undefined} | ${undefined}
    `('createMockWorkspaceConfiguration get $key $scope', ({ key, scope, expected }) => {
        const data = sampleConfigData();
        const config = createMockWorkspaceConfiguration<TestConfig>(data, undefined, scope);
        const v = config.get(key);
        expect(v).toEqual(expected);

        const [ext, ...tail] = key.split('.');
        const sub = tail.join('.');
        const extConfig = config.__getConfiguration(ext, scope);
        expect(extConfig.get(sub)).toEqual(expected);

        expect(config.__inspect_data__).toBe(data);
    });

    test('createMockWorkspaceConfiguration update', async () => {
        const data = sampleConfigData();
        const config = createMockWorkspaceConfiguration<TestConfig>(data, undefined, { languageId: 'php' });
        expect(config.get('myExtension.show')).toBe(false);
        expect(config.get('otherExtension.delay')).toBe(50);

        await config.update('otherExtension.delay', 100);
        expect(config.get('otherExtension.delay')).toBe(100);

        expect(config.inspect('myExtension.name')).toEqual({
            defaultLanguageValue: 'default[php]',
            key: 'myExtension.name',
            workspaceValue: 'workspace',
        });
        await config.update('myExtension.name', 'global', true);
        expect(config.inspect('myExtension.name')).toEqual({
            defaultLanguageValue: 'default[php]',
            key: 'myExtension.name',
            globalValue: 'global',
            workspaceValue: 'workspace',
        });
        expect(config.get('myExtension.name')).toBe('workspace');
        await config.update('myExtension.name', 'workspace-language', false, true);
        expect(config.inspect('myExtension.name')).toEqual({
            defaultLanguageValue: 'default[php]',
            key: 'myExtension.name',
            globalValue: 'global',
            workspaceValue: 'workspace',
            workspaceLanguageValue: 'workspace-language',
        });
        await config.update('myExtension.name', 'workspaceFolder-language', undefined, true);
        expect(config.inspect('myExtension.name')).toEqual({
            key: 'myExtension.name',
            defaultLanguageValue: 'default[php]',
            globalValue: 'global',
            workspaceValue: 'workspace',
            workspaceLanguageValue: 'workspace-language',
            workspaceFolderLanguageValue: 'workspaceFolder-language',
        });
        await config.update('otherExtension.delay', 42, null, true);
        expect(config.inspect('otherExtension.delay')).toEqual({
            key: 'otherExtension.delay',
            defaultValue: 50,
            workspaceFolderLanguageValue: 42,
            workspaceFolderValue: 100,
        });
        await config.update('otherExtension.delay', 84, ConfigurationTarget.Global, true);
        expect(config.inspect('otherExtension.delay')).toEqual({
            key: 'otherExtension.delay',
            defaultValue: 50,
            globalLanguageValue: 84,
            workspaceFolderLanguageValue: 42,
            workspaceFolderValue: 100,
        });
    });

    test('MockWorkspaceConfiguration.inspect', () => {
        const data = sampleConfigData();
        const config = createMockWorkspaceConfiguration<TestConfig>(data);
        const configExtName = config.__getConfiguration('myExtension.name');
        const configExtName2 = createMockWorkspaceConfiguration<TestConfig>(data, 'myExtension.name');
        const configExtPhp = config.__getConfiguration('myExtension', { languageId: 'php' });

        expect(configExtName2).toEqual(oc(extractFields(configExtName, ['__inspect_data__', '__languageId', '__section'])));
        expect(configExtName.inspect('')).toEqual({
            key: 'myExtension.name',
            workspaceValue: 'workspace',
        });
        expect(configExtPhp.inspect('name')).toEqual({
            key: 'myExtension.name',
            defaultLanguageValue: 'default[php]',
            workspaceValue: 'workspace',
        });

        expect(configExtPhp.__getConfiguration('', { languageId: 'json' }).inspect('jsonExtension.name')).toEqual({
            key: 'jsonExtension.name',
            defaultLanguageValue: 'json-default',
        });
    });
});

// function oc<T>(t: Partial<T>): T {
//     return expect.objectContaining(t);
// }

function sampleConfigData(): MockWorkspaceConfigurationData<TestConfig> {
    const cfg: MockWorkspaceConfigurationData<TestConfig> = clone({
        '[*]': {
            defaultValue: {
                myExtension: {
                    show: true,
                },
                otherExtension: {
                    delay: 50,
                    position: 'above',
                },
            },
            globalValue: {
                myExtension: {
                    values: ['global'],
                },
            },
            workspaceValue: {
                myExtension: {
                    name: 'workspace',
                    show: false,
                    values: ['workspace'],
                },
                otherExtension: {
                    show: true,
                },
            },
        },
        '[php]': {
            defaultValue: {
                myExtension: {
                    name: 'default[php]',
                },
            },
        },
        '[json]': {
            defaultValue: {
                jsonExtension: {
                    name: 'json-default',
                },
            },
        },
    });
    return cfg;
}

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}

function extractFields<T, K extends keyof T = keyof T>(t: T, keys: K[]): Pick<T, K> {
    return Object.assign({}, ...keys.map((k) => ({ [k]: t[k] })));
}

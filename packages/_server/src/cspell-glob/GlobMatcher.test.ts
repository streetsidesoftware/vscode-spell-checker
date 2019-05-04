import { GlobMatcher } from './GlobMatcher';

describe('Validate GlobMatcher', () => {
    tests().forEach(([patterns, root, filename, expected, description], index) => {
        test(`test ${index} ${description}, pattern: [${patterns}] filename: "${filename}", root: "${root}"`, () => {
            const matcher = new GlobMatcher(patterns, root);
            expect(matcher.match(filename)).toBe(expected);
        });
    });
});

function tests(): [string[], string | undefined, string, boolean, string][] {
    return [

        [['*.json'],                undefined, '/settings.json', true, '*.json'],
        [['.vscode'],               undefined, '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               undefined, '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['/*.json'],               undefined, '/src/settings.json', false, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  undefined, '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              undefined, '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              undefined, '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              undefined, '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           undefined, '/src/.vscode/settings.json', true,  'should match nested .vscode/'],
        [['**/.vscode'],            undefined, '/src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
        [['**/.vscode/**'],         undefined, '/src/.vscode/settings.json', true,  'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], undefined, '/User/user/Library/settings.json', true, 'Match system root'],

        [['*.json'],                undefined, 'settings.json', true, '*.json'],
        [['.vscode'],               undefined, '.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               undefined, 'settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['/*.json'],               undefined, 'src/settings.json', false, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  undefined, 'src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              undefined, '.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              undefined, '.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              undefined, 'src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           undefined, 'src/.vscode/settings.json', true,  'should match nested .vscode/'],
        [['**/.vscode'],            undefined, 'src/.vscode/settings.json', false, 'should not match nested **/.vscode'],
        [['**/.vscode/**'],         undefined, 'src/.vscode/settings.json', true,  'should match nested **/.vscode'],
        [['/User/user/Library/**'], undefined, 'src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], undefined, 'User/user/Library/settings.json', true, 'Match system root'],

        // With Root
        [['*.json'],                '/User/code/src', '/User/code/src/settings.json', true, 'With Root *.json'],
        [['.vscode'],               '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode'],
        [['/*.json'],               '/User/code/src', '/User/code/src/settings.json', true, 'With Root Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/code/src', '/User/code/src/src/settings.js', true, 'With Root Matches nested files, *.js'],
        [['.vscode/'],              '/User/code/src', '/User/code/src/.vscode/settings.json', true, 'With Root .vscode/'],
        [['.vscode/'],              '/User/code/src', '/User/code/src/.vscode', true, 'With Root .vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/code/src', '/User/code/src/src/.vscode/settings.json', false, 'With Root shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/code/src', '/User/code/src/src/.vscode/settings.json', true, 'With Root should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/code/src', '/src/User/user/Library/settings.json', false, 'With Root No match'],
        [['/User/user/Library/**'], '/User/code/src', '/User/user/Library/settings.json', true, 'With Root Match system root'],

        // With non matching Root
        [['*.json'],                '/User/lib/src', '/User/code/src/settings.json', true, 'With non matching Root *.json'],
        [['.vscode'],               '/User/lib/src', '/User/code/src/.vscode/settings.json', true, 'With non matching Root .vscode'],
        [['/*.json'],               '/User/lib/src', '/User/code/src/settings.json', false, 'With non matching Root Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/lib/src', '/User/code/src/src/settings.js', true, 'With non matching Root Matches nested files, *.js'],
        [['.vscode/'],              '/User/lib/src', '/User/code/src/.vscode/settings.json', false, 'With non matching Root .vscode/'],
        [['.vscode/'],              '/User/lib/src', '/User/code/src/.vscode', false, 'With non matching Root .vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/lib/src', '/User/code/src/src/.vscode/settings.json', false, 'With non matching Root shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/lib/src', '/User/code/src/src/.vscode/settings.json', true, 'With non matching Root should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/lib/src', '/src/User/user/Library/settings.json', false, 'With non matching Root No match'],
        [['/User/user/Library/**'], '/User/lib/src', '/User/user/Library/settings.json', true, 'With non matching Root Match system root'],

        // Root with trailing /
        [['*.json'],                '/User/code/src/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '/User/code/src/', '/User/code/src/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/User/code/src/', '/User/code/src/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '/User/code/src/', '/User/code/src/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '/User/code/src/', '/User/code/src/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/User/code/src/', '/User/code/src/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/User/code/src/', '/User/code/src/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/User/code/src/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/User/code/src/', '/User/user/Library/settings.json', true, 'Match system root'],

        // System Root /
        [['*.json'],                '/', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '/', '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '/', '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '/', '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '/', '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '/', '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '/', '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '/', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '/', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '/', '/User/user/Library/settings.json', true, 'Match system root'],

        // Empty Root /
        [['*.json'],                '', '/User/code/src/settings.json', true, '*.json'],
        [['.vscode'],               '', '/.vscode/settings.json', true, '.vscode'],
        [['/*.json'],               '', '/settings.json', true, 'Matches only root level files, /*.json'],            // .
        [['*.js'],                  '', '/src/settings.js', true, '// Matches nested files, *.js'],
        [['.vscode/'],              '', '/.vscode/settings.json', true, '.vscode/'],
        [['.vscode/'],              '', '/.vscode', true, '.vscode/'],  // This one shouldn't match, but micromatch says it should. :-(
        [['.vscode/'],              '', '/src/.vscode/settings.json', false, 'shouldn\'t match nested .vscode/'],
        [['**/.vscode/'],           '', '/src/.vscode/settings.json', true, 'should match nested .vscode/'],
        [['/User/user/Library/**'], '', '/src/User/user/Library/settings.json', false, 'No match'],
        [['/User/user/Library/**'], '', '/User/user/Library/settings.json', true, 'Match system root'],

        // Special characters
        [['#'],                     '', '/User/code/src/settings.json', false, 'Only comments'],
        [[' #'],                    '', '/User/code/src/settings.json', false, 'Only comments'],
        [['#', '*.json', '#'],      '', '/User/code/src/settings.json', true, 'Comments'],
        [['#', '*.json', '*.js'],   '', '/User/code/src/settings.js',   true, 'Multiple patterns'],
        [['#', '**/src/', '*.js'],  '', '/User/code/src/settings.js',  true, 'Multiple patterns'],
        [['{*.js,*.json}'],         '', '/User/code/src/settings.js',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/src/settings.json',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/dist/settings.json',  true, 'Braces'],
        [['{src,dist}'],            '', '/User/code/distribution/settings.json',  false, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/src/settings.json',  true, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/dist/settings.json',  true, 'Braces'],
        [['**/{src,dist}/**'],      '', '/User/code/lib/settings.json',  false, 'Braces'],
        [['{*.js,*.json}'],         '', '/User/code/src/settings.js',  true, 'Braces'],
        [['#', '**/dist/', '*.js'], '', '/User/code/src/settings.js',  true, 'Multiple patterns'],
        [['#', '**/dist/', '*.js'], '', '/User/code/src/settings.json',  false, 'Multiple patterns'],
        [['#', '**/dist/', '*.js*'],'', '/User/code/src/settings.json',  true, 'Multiple patterns'],
        [['settings.js'],           '', '/User/code/src/settings.js',  true, 'settings.js'],
        [['!settings.js'],          '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!!settings.js'],         '', '/User/code/src/settings.js',  true, 'Negations'],
        [['!!!settings.js'],        '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!/**/settings.js'],      '', '/User/code/src/settings.js',  false, 'Negations'],
        [['!!/**/settings.js'],     '', '/User/code/src/settings.js',  true, 'Negations'],
        [['!**/settings.js'],       '', '/User/code/src/settings.js',  false, 'Negations'],
        [['#', '**/src/', '*.js', '!**/settings.js'], '', '/User/code/src/settings.js',  false, 'Negations'],
    ];
}

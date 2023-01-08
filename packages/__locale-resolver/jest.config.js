module.exports = {
    verbose: true,
    roots: ['./src'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '\\.(test|spec|perf)\\.tsx?$',
    testPathIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
        '\\.(css|less)$': '<rootDir>/src/__mocks__/styleMock.js',
        '^vscode$': '<rootDir>/src/__mocks__/vscode.js',
    },
};

// cspell:ignore webm

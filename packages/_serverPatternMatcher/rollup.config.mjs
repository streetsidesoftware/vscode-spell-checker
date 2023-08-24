import dts from 'rollup-plugin-dts';

const config = [
    {
        input: './dist/api.d.ts',
        output: [{ file: './dist/api.d.cts', format: 'es' }],
        plugins: [dts()],
    },
];

export default config;

import typescript from '@rollup/plugin-typescript';
export default {
    input: './src/hierarchyTree.ts',
    output: {
        file: 'dist/bundle.js',
        name: 'hierarchy-tree',
        format: 'esm'
    },
    plugins: [
        typescript()
    ]
}
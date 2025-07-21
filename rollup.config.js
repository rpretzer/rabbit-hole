// rollup.config.js - JavaScript bundling configuration
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'scripts/app.js',
    output: [
        {
            file: 'dist/app.js',
            format: 'es',
            sourcemap: true
        },
        {
            file: 'dist/app.min.js',
            format: 'es',
            sourcemap: true,
            plugins: [terser()]
        }
    ],
    plugins: [
        nodeResolve()
    ],
    watch: {
        include: 'scripts/**'
    }
};
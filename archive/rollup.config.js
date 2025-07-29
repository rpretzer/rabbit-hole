// rollup.config.js - Simple bundling for optimization only
import terser from '@rollup/plugin-terser';

export default {
    input: 'scripts/app.js',
    output: {
        file: 'dist/app.min.js',
        format: 'es',
        sourcemap: true,
        plugins: [terser({
            compress: {
                drop_console: true,
                drop_debugger: true
            },
            mangle: {
                toplevel: true
            }
        })]
    },
    // Don't bundle external modules - keep them as imports
    external: [
        './modules/ContentManager.js',
        './modules/NavigationManager.js',
        './modules/ThemeManager.js',
        './modules/AnimationManager.js',
        './modules/renderers.js'
    ]
};
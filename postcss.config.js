// postcss.config.js - CSS processing configuration
module.exports = {
    plugins: [
        require('postcss-import')({
            path: ['styles']
        }),
        require('postcss-preset-env')({
            stage: 3,
            features: {
                'nesting-rules': true,
                'custom-properties': true,
                'custom-media-queries': true,
                'custom-selectors': true
            }
        }),
        require('autoprefixer')({
            cascade: false
        }),
        ...(process.env.NODE_ENV === 'production' ? [
            require('cssnano')({
                preset: [
                    'default',
                    {
                        discardComments: {
                            removeAll: true
                        },
                        minifyFontValues: {
                            removeQuotes: false
                        }
                    }
                ]
            })
        ] : [])
    ]
};
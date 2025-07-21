// postcss.config.js - Simplified for optional optimization
module.exports = {
  plugins: [
    // Import statements to combine CSS files
    require('postcss-import')({
      path: ['styles']
    }),
    
    // Add browser prefixes
    require('autoprefixer')({
      overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead']
    }),
    
    // Minify for production only
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
        // Preserve custom properties (CSS variables)
        customProperties: false,
        // Keep calc() for browser support
        calc: false
      }]
    })
  ]
}
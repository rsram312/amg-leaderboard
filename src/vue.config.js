import { defineConfig } from '@vue/cli-service'

export default defineConfig({
  // Public path - adjust for GitHub Pages or other hosts
  publicPath: process.env.NODE_ENV === 'production' ? '/amg-leaderboard/' : '/',

  // Build output directory
  outputDir: 'dist',

  // Disable eslint on save for production
  lintOnSave: process.env.NODE_ENV !== 'production',

  // Webpack configuration
  configureWebpack: {
    performance: {
      hints: false, // Disable warnings about large assets
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
  },

  // Disable source maps for faster builds
  productionSourceMap: false,

  // CSS configuration for global SCSS or additional styles
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/styles/global.scss"; // Add global styles here
        `,
      },
    },
  },

  // Dev server configuration
  devServer: {
    port: 8080, // Change port if needed
    open: true, // Open the browser on start
    hot: true, // Enable hot module replacement
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  // Transpile specific dependencies
  transpileDependencies: [
    'vuetify', // If using Vuetify or other packages
  ],

  // PWA configuration if using service workers
  pwa: {
    name: 'Leaderboard',
    themeColor: '#2E3A47',
    msTileColor: '#2E3A47',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
  },

  // Plugin options (optional)
  pluginOptions: {
    // Custom plugin configurations go here
  },

  // Allow assets from Google Sheets or external domains
  chainWebpack: (config) => {
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .tap((options) => {
        options.limit = 10000
        return options
      })
  },

  // Enable automatic deployment to GitHub Pages after build
  pages: {
    index: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
    },
  },
})

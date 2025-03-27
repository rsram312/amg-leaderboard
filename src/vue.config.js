const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? '/my-project/' // Replace 'my-project' with your GitHub repo name
    : '/'
});
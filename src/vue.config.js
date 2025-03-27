import { defineConfig } from '@vue/cli-service'

export default defineConfig({
  // Set public path correctly for GitHub Pages
  publicPath: process.env.NODE_ENV === 'production' ? '/amg-leaderboard/' : '/'
})
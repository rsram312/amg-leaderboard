<template>
  <Leaderboard />
</template>

<script>
import Leaderboard from './components/leader-board.vue'

export default {
  name: 'App',
  components: {
    Leaderboard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

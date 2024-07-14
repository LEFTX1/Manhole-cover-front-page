<template>
  <div id="app">
    <nav>
      <RouterLink to="/Matters">Go to Matters</RouterLink>
    </nav>
    <RouterView />
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router';

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView
  }
};
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f2f5;
}

.map-card {
  width: 90%;
  max-width: 1200px;
  margin: 20px auto;
}
</style>
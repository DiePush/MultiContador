<template>
  <img alt="Vue logo" src="./assets/logo.png" class="logo">
  <MultiContadores msg="Welcome to Your Vue.js App" />
</template>

<script>
import MultiContadores from './components/MultiContadores.vue';

export default {
  name: 'App',
  components: {
    MultiContadores,
  },
};
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

.logo {
  width: 50%; /* Ajusta este valor para cambiar el tamaño del logo */
  height: auto; /* Mantén la proporción */
  margin-bottom: -50px; /* Espaciado debajo del logo */
}
</style>

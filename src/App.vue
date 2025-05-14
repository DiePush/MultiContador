<template>
  <img alt="Vue logo" src="./assets/logo.png" class="logo">
  <router-view />
</template>

<script>
 /* import MultiContadores from './components/MultiContadores.vue'; */
 
export default {
  name: 'App',

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
  width: 30%; /* Ajusta este valor para cambiar el tamaño del logo */
  height: auto; /* Mantén la proporción */
  margin-bottom: -50px; /* Espaciado debajo del logo */
}
</style>

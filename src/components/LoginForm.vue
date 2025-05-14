<template>
    <div class="login-container">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="iniciarSesion">
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input type="text" v-model="usuario" id="usuario" required />
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input type="password" v-model="contrasena" id="contrasena" required />
        </div>
        <button type="submit">Ingresar</button>
      </form>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        usuario: '',
        contrasena: '',
        error: ''
      };
    },
    methods: {
      iniciarSesion() {
        // Datos de prueba
        const usuarioValido = 'admin';
        const contrasenaValida = '1234';
  
        if (this.usuario === usuarioValido && this.contrasena === contrasenaValida) {
          alert('Inicio de sesión exitoso');
          this.error = '';
          sessionStorage.setItem('autenticado', 'true'); 
          this.$router.push('/contadores');
        } else {
          this.error = 'Usuario o contraseña incorrectos';
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: 80px auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  .form-group {
    margin-bottom: 15px;
  }
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    width: 100%;
    padding: 10px;
    background-color: #4caf50;
    border: none;
    color: white;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover {
    background-color: #45a049;
  }
  .error {
    color: red;
    text-align: center;
    margin-top: 10px;
  }
  </style>
  
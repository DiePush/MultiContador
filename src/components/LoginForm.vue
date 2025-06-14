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

    <div style="margin: 20px 0; text-align:center;">— o —</div>

    <button @click="iniciarSesionGoogle" class="google-login-btn">
      Iniciar sesión con Google
    </button>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadGapiInsideDOM, gapi } from 'gapi-script'

const usuario = ref('')
const contrasena = ref('')
const error = ref('')

const CLIENT_ID = '436730530714-sj5puaqunc0fn9clr19phkfkqgaemoip.apps.googleusercontent.com'
let auth2 = null

onMounted(async () => {
  await loadGapiInsideDOM();
  await new Promise((resolve) => {
    gapi.load('auth2', async () => {
      auth2 = await gapi.auth2.init({
        client_id: CLIENT_ID
      });
      resolve();
    });
  });
});


function iniciarSesion() {
  const usuarioValido = 'admin'
  const contrasenaValida = '1234'

  if (usuario.value === usuarioValido && contrasena.value === contrasenaValida) {
    alert('Inicio de sesión exitoso')
    error.value = ''
    sessionStorage.setItem('autenticado', 'true')
    // redirigir
    window.location.href = '/contadores'
  } else {
    error.value = 'Usuario o contraseña incorrectos'
  }
}

async function iniciarSesionGoogle() {
  if (!auth2) {
    error.value = 'La autenticación de Google aún no está lista. Por favor intenta de nuevo.';
    return;
  }

  try {
    const googleUser = await auth2.signIn({ prompt: 'select_account' });
    const profile = googleUser.getBasicProfile();

    alert(`Bienvenido, ${profile.getName()}`);
    error.value = '';
    sessionStorage.setItem('autenticado', 'true');
    window.location.href = '/contadores';
  } catch (e) {
    error.value = 'Error al iniciar sesión con Google';
    console.error(e);
  }
}

</script>
  
  <style scoped>
  .google-login-btn {
  width: 100%;
  padding: 10px;
  background-color: #4285f4;
  border: none;
  color: white;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
}
.google-login-btn:hover {
  background-color: #357ae8;
}
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
  
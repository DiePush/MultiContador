
<template>
  <div class="container">
    <h1>Multicontadores</h1>
    <div class="button-group">
      <button @click="mostrarModal = true" :disabled="contadores.length >= 12">
        Agregar Contador
      </button>
      <button @click="mostrarModalEliminar = true" :disabled="contadores.length === 0">
        Eliminar Contador
      </button>
      <button @click="mostrarModalExportar = true" :disabled="historial.length === 0">
        Exportar a Excel
      </button>
      <button @click="iniciarCuentaRegresiva" :disabled="contadores.length === 0 || cuentaRegresivaActiva">
        Iniciar Cuenta Regresiva
      </button>
      <button @click="cerrarSesion">Cerrar sesión</button>

    </div>

    <div class="global-timer">
      <h2>Tiempo Global Restante: {{ formatTime(tiempoGlobalRestante) }}</h2>
    </div>

    <div class="contadores">
      <div v-for="contador in contadores" :key="contador.id" class="contador" :style="{ backgroundColor: contador.color }">
        <p><strong>{{ contador.nombre }}</strong></p>
        <div class="increment-buttons">
          <div class="button-group-inline category-box">
            <button @click="decrementarCategoria(contador.id, 'livianos')">-</button>
            <span>Livianos ({{ contador.livianos }})</span>
            <button @click="incrementarCategoria(contador.id, 'livianos')">+</button>
          </div>
          <div class="button-group-inline category-box">
            <button @click="decrementarCategoria(contador.id, 'pesados')">-</button>
            <span>Pesados ({{ contador.pesados }})</span>
            <button @click="incrementarCategoria(contador.id, 'pesados')">+</button>
          </div>
          <div class="button-group-inline category-box">
            <button @click="decrementarCategoria(contador.id, 'autobuses')">-</button>
            <span>Autobuses ({{ contador.autobuses }})</span>
            <button @click="incrementarCategoria(contador.id, 'autobuses')">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para ingresar el nombre del contador -->
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal">
        <h2>Nuevo Contador</h2>
        <input v-model="nuevoNombre" type="text" placeholder="Ingrese el nombre" />
        <div class="color-picker">
          <label v-for="color in coloresPastel" :key="color" :style="{ backgroundColor: color }">
            <input type="radio" v-model="nuevoColor" :value="color" />
          </label>
        </div>
        <p v-if="errorMensaje" class="error">{{ errorMensaje }}</p>
        <div class="modal-buttons">
          <button @click="confirmarNombre">Aceptar</button>
          <button @click="cerrarModal">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal para eliminar contadores -->
    <div v-if="mostrarModalEliminar" class="modal-overlay">
      <div class="modal">
        <h2>Eliminar Contador</h2>
        <div class="contador-lista">
          <div v-for="contador in contadores" :key="contador.id" class="contador-item">
            <span>{{ contador.nombre }}</span>
            <button @click="confirmarEliminar(contador.id)" class="eliminar">Eliminar</button>
          </div>
        </div>
        <div class="modal-buttons">
          <button @click="cerrarModalEliminar">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay">
      <div class="modal">
        <h2>Confirmar Eliminación</h2>
        <p>¿Estás seguro de que deseas eliminar el contador <strong>{{ contadorAEliminar.nombre }}</strong>?</p>
        <div class="modal-buttons">
          <button @click="eliminarContadorConfirmado">Sí, eliminar</button>
          <button @click="cerrarModalConfirmacion">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal para ingresar el nombre del archivo Excel -->
    <div v-if="mostrarModalExportar" class="modal-overlay">
      <div class="modal">
        <h2>Exportar a Excel</h2>
        <input v-model="nombreArchivo" type="text" placeholder="Ingrese el nombre del archivo" />
        <div class="modal-buttons">
          <button @click="exportarExcel">Exportar</button>
          <button @click="cerrarModalExportar">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- Modal para mostrar cómo utilizar -->
    <div v-if="mostrarModalComoUtilizar" class="modal-overlay">
  <div class="modal como-utilizar">
    <h3>¿Cómo se utilizan los contadores?</h3>
    <p><strong>Paso 1:</strong> Presiona el botón "Agregar Contador".</p>
    <p><strong>Paso 2:</strong> Ponle un nombre y selecciona un color para el contador.</p>
    <p><strong>Paso 3:</strong> Presiona el botón "Aceptar".</p>
    <p><strong>Paso 4:</strong> Una vez que tengas la cantidad necesaria de contadores, presiona el botón <b>"Iniciar Cuenta Regresiva"</b>.</p>
    <p><strong>Paso 5:</strong> Cuando necesites añadir un nuevo número, presiona el <b>+</b> y, si te equivocaste, presiona el <b>-</b> para restar.</p>

    <h3>¿Cómo exportar los datos?</h3>
    <p><strong>Paso 1:</strong> Una vez terminados los 15 minutos, los datos se guardarán automáticamente en un archivo de Excel. Si deseas, puedes presionar el botón <b>"Exportar a Excel"</b> para verificar que toda la información esté correcta.</p>
    <p><strong>Paso 2:</strong> Ponle un nombre al archivo de Excel.</p>
    <p><strong>Paso 3:</strong> Presiona el botón <b>"Aceptar"</b>.</p>
    <p><strong>Paso 4:</strong> Revisa la carpeta de descargas.</p>

    <h3>¿Cómo eliminar un contador?</h3>
    <p><strong>Paso 1:</strong> Presiona el botón <b>"Eliminar contador"</b>.</p>
    <p><strong>Paso 2:</strong> Selecciona cuál es el contador que deseas eliminar.</p>
    <p><strong>Paso 3:</strong> Haz la doble verificación y el contador se eliminará.</p>

    <h3>Información adicional:</h3>
    <p>La información se guarda cuando el contador termina. Si tu contador aún tiene 30 segundos, significa que el total de los últimos 15 minutos aún no está reflejado en el archivo de Excel.</p>
    <p>El temporizador seguirá funcionando aunque el usuario esté fuera de la web. Sin embargo, si llega a 0 y el usuario no ingresa a la web, quedará pausado hasta que el usuario vuelva a ingresar.</p>
    <p>Se recomienda que, si van a receso de almuerzo, guarden los datos antes, ya que podrían ocurrir errores y la información podría perderse.</p>

    <div class="modal-buttons">
      <button @click="cerrarModalComoUtilizar">Cerrar</button>
    </div>
  </div>
</div>



    <!-- Botón para mostrar cómo utilizar -->
    <div class="como-utilizar">
      <button @click="mostrarModalComoUtilizar = true">Cómo Utilizar</button>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { uploadExcelToDrive } from '@/services/GoogleDriveService';
//import { getCurrentUser } from '@/services/GoogleAuth';
//import { gapi } from 'gapi-script';
import { initGoogleAPI } from '@/services/GoogleInit.js';


export default {
  data() {
    return {
      contadores: JSON.parse(localStorage.getItem('contadores')) || [],
      historial: JSON.parse(localStorage.getItem('historial')) || [],
      siguienteId: JSON.parse(localStorage.getItem('siguienteId')) || 1,
      intervalos: {},
      mostrarModal: false,
      mostrarModalEliminar: false,
      mostrarModalConfirmacion: false,
      mostrarModalExportar: false,
      mostrarModalComoUtilizar: false,
      nuevoNombre: "",
      nuevoColor: "#FFB3BA", // Color por defecto
      nombreArchivo: "",
      errorMensaje: "",
      cuentaRegresivaActiva: false,
      temporizadorGlobal: null,
      tiempoGlobalRestante: 900, // Tiempo global inicial (15 minutos)
      contadorAEliminar: null,
      coloresPastel: ["#FFB3BA", "#FFDFBA", "#FFFFBA", "#BAFFC9", "#BAE1FF", "#D7BDE2", "#FAD7A0", "#F5B7B1", "#AED6F1", "#A3E4D7", "#F9E79F", "#D2B4DE"]
    };
  },
  methods: {
    confirmarNombre() {
      if (!this.nuevoNombre.trim()) {
        this.errorMensaje = "El nombre no puede estar vacío.";
        return;
      }

      if (this.contadores.some(c => c.nombre.toLowerCase() === this.nuevoNombre.toLowerCase())) {
        this.errorMensaje = "Ya existe un contador con este nombre.";
        return;
      }

      this.agregarContador(this.nuevoNombre.trim(), this.nuevoColor);
      this.nuevoNombre = "";
      this.nuevoColor = "#FFFFFF"; // Restablecer color por defecto
      this.errorMensaje = "";
      this.mostrarModal = false;
    },
    cerrarModal() {
      this.nuevoNombre = "";
      this.nuevoColor = "#FFFFFF"; // Restablecer color por defecto
      this.errorMensaje = "";
      this.mostrarModal = false;
    },
    cerrarModalEliminar() {
      this.mostrarModalEliminar = false;
    },
    cerrarModalConfirmacion() {
      this.mostrarModalConfirmacion = false;
      this.contadorAEliminar = null;
    },
    cerrarModalExportar() {
      this.nombreArchivo = "";
      this.mostrarModalExportar = false;
    },
    cerrarModalComoUtilizar() {
      this.mostrarModalComoUtilizar = false;
    },
    agregarContador(nombre, color) {
      if (this.contadores.length < 12) {
        const horaActual = new Date();
        const inicio = this.formatHour(horaActual);
        const fin = this.formatHour(new Date(horaActual.getTime() + 15 * 60000));
        const nuevoContador = {
          id: this.siguienteId++,
          nombre,
          color,
          tiempoRestante: 900,
          livianos: 0,
          pesados: 0,
          autobuses: 0,
          intervalo: `${inicio} - ${fin}`
        };
        this.contadores.push(nuevoContador);
        this.guardarDatos();
      }
    },
    incrementarCategoria(id, categoria) {
      const index = this.contadores.findIndex(c => c.id === id);
      if (index !== -1) {
        this.contadores[index][categoria]++;
        this.guardarDatos();
      }
    },
    decrementarCategoria(id, categoria) {
      const index = this.contadores.findIndex(c => c.id === id);
      if (index !== -1 && this.contadores[index][categoria] > 0) {
        this.contadores[index][categoria]--;
        this.guardarDatos();
      }
    },
    confirmarEliminar(id) {
      this.contadorAEliminar = this.contadores.find(c => c.id === id);
      this.mostrarModalConfirmacion = true;
    },
    eliminarContadorConfirmado() {
      if (this.contadorAEliminar) {
        const index = this.contadores.findIndex(c => c.id === this.contadorAEliminar.id);
        if (index !== -1) {
          this.contadores.splice(index, 1);
          this.guardarDatos();
        }

        // Si ya no hay contadores, detener el temporizador global y reiniciar el tiempo
        if (this.contadores.length === 0) {
          this.detenerTemporizadorGlobal();
          this.tiempoGlobalRestante = 900; // 15 minutos
        }

        this.cerrarModalConfirmacion();
      }
    },
    iniciarCuentaRegresiva() {
  if (this.temporizadorGlobal) clearInterval(this.temporizadorGlobal);

  // Guardar el tiempo de inicio como marca de tiempo
  const tiempoInicio = Date.now();
  const tiempoGlobal = this.tiempoGlobalRestante * 1000; // Convertir a milisegundos

  this.cuentaRegresivaActiva = true;
  this.temporizadorGlobal = setInterval(() => {
    const tiempoTranscurrido = Date.now() - tiempoInicio; // Tiempo transcurrido
    const nuevoTiempoRestante = Math.max(tiempoGlobal - tiempoTranscurrido, 0); // Calcular tiempo restante

    this.tiempoGlobalRestante = Math.floor(nuevoTiempoRestante / 1000); // Convertir de milisegundos a segundos

    // Actualizar cada contador individual
    this.contadores.forEach(contador => {
      const tiempoTranscurridoContador = tiempoTranscurrido;
      const nuevoTiempoRestanteContador = Math.max(contador.tiempoRestante * 1000 - tiempoTranscurridoContador, 0);
      contador.tiempoRestante = Math.floor(nuevoTiempoRestanteContador / 1000);
    });

    if (this.tiempoGlobalRestante === 0) {
      // Guardar en historial y reiniciar
      this.contadores.forEach(contador => {
        this.guardarEnHistorial(contador.id);
      });
     //  this.mostrarModalExportarAutomaticamente();
      this.reiniciarCuentaRegresiva();
    }

    this.guardarDatos();
  }, 1000);
},
/*
mostrarModalExportarAutomaticamente() {
  this.mostrarModalExportar = true;
  this.detenerTemporizadorGlobal();
},*/

    reiniciarCuentaRegresiva() {
      this.tiempoGlobalRestante = 900;
      this.contadores.forEach(contador => {
        contador.tiempoRestante = 900;
        contador.livianos = 0;
        contador.pesados = 0;
        contador.autobuses = 0;
      });
      this.iniciarCuentaRegresiva();
    },
    detenerTemporizadorGlobal() {
      clearInterval(this.temporizadorGlobal);
      this.cuentaRegresivaActiva = false;
    },
    guardarEnHistorial(id) {
      const contador = this.contadores.find(c => c.id === id);
      if (contador) {
        const ahora = new Date(); // Hora actual
        const inicioIntervalo = new Date(ahora.getTime() - (900 - this.tiempoGlobalRestante) * 1000);
        const finIntervalo = ahora;

        this.historial.push({
          "Intervalo": `${this.formatHour(inicioIntervalo)} - ${this.formatHour(finIntervalo)}`,
          "Nombre del contador": contador.nombre,
          "Livianos": contador.livianos,
          "Pesados": contador.pesados,
          "Autobuses": contador.autobuses,
          "Total": contador.livianos + contador.pesados + contador.autobuses,
          "Hora de Registro": ahora.toLocaleTimeString()
        });

        // Guardar en localStorage
        localStorage.setItem('historial', JSON.stringify(this.historial));

        // Reiniciar contadores
        contador.livianos = 0;
        contador.pesados = 0;
        contador.autobuses = 0;
        contador.tiempoRestante = 900; // Reiniciar tiempo a 15 minutos
      }
    },

async exportarExcel() {
  if (this.historial.length === 0) return;

  try {
    const auth2 = await initGoogleAPI(); // 👈 INICIALIZAR GAPI
    await auth2.signIn({
     scope: 'https://www.googleapis.com/auth/drive.file'
    });
    const googleUser = auth2.currentUser.get();

    if (!googleUser.isSignedIn()) throw new Error('Usuario no está autenticado');

    const accessToken = googleUser.getAuthResponse().access_token;

    const libro = XLSX.utils.book_new();
    this.contadores.forEach(contador => {
      const data = this.historial.filter(entry => entry["Nombre del contador"] === contador.nombre);
      const hoja = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(libro, hoja, contador.nombre);
    });

    const fecha = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const nombreArchivoFinal = this.nombreArchivo.trim() ? this.nombreArchivo.trim() : `historial_contadores_${fecha}`;
    const nombreConExtension = `${nombreArchivoFinal}.xlsx`;

    const workbookBinary = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([workbookBinary], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    await uploadExcelToDrive(file, accessToken);
    XLSX.writeFile(libro, nombreConExtension);

    this.cerrarModalExportar();
  } catch (error) {
    console.error('Error al exportar y subir:', error);
    alert(error.message);
  }
},


    formatTime(seconds) {
      const minutos = Math.floor(seconds / 60);
      const segundos = seconds % 60;
      return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
    },
    formatHour(date) {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    guardarDatos() {
      localStorage.setItem('contadores', JSON.stringify(this.contadores));
      localStorage.setItem('siguienteId', JSON.stringify(this.siguienteId));
      localStorage.setItem('historial', JSON.stringify(this.historial));
    },
    cerrarSesion() {
    sessionStorage.removeItem('autenticado');
    this.$router.push('/');
  }
  },
  
  mounted() {
    // No iniciar temporizadores individuales
  
  }
  
};

</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  max-width: 800px;
  margin: auto;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.button-group button {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #000;
  border-radius: 8px;
  cursor: pointer;
  background-color: #f0f0f0;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.button-group button:hover {
  background-color: #e0e0e0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.global-timer {
  margin-top: 20px;
  text-align: center;
  font-size: 18px;
}

.contadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 800px;
}

.contador {
  border: 2px solid #000;
  padding: 10px;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.contador:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.increment-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.button-group-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.button-group-inline button {
  padding: 8px;
  font-size: 12px;
  border: 1px solid #000;
  cursor: pointer;
  border-radius: 8px;
  background-color: #f0f0f0;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.button-group-inline button:hover {
  background-color: #e0e0e0;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.category-box {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.category-box:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal.como-utilizar {
  background: white;
  padding: 20px;
  border: 1px solid #000;
  text-align: left;
  font-size: 12px;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
} 

.modal {
  background: white;
  padding: 20px;
  border: 1px solid #000;
  text-align: center;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.contador-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.contador-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.contador-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.color-picker label {
  width: 30px;
  height: 30px;
  border-radius: 30%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border 0.3s;
}

.color-picker input[type="radio"] {
  display: none;
}

.color-picker input[type="radio"]:checked + label {
  border: 2px solid #000;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}

/* Responsividad */
@media (max-width: 600px) {
  .modal.como-utilizar {
  background: white;
  padding: 20px;
  border: 1px solid #000;
  text-align: left;
  font-size: 9px;
  width: 90%;
  max-width: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

} 
  .button-group {
    flex-direction: column;
    width: 100%;
  }

  .button-group button {
    width: 100%;
  }

  .contadores {
    grid-template-columns: 1fr;
  }

  .modal-buttons {
    justify-content: center;
    gap: 10px;
  }
}
</style>
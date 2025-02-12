<template>
  <div class="container">
    <h1>Multicontadores</h1>
    <div class="button-group">
      <button @click="mostrarModal = true" :disabled="contadores.length >= 12">
        Agregar Contador
      </button>
      <button @click="mostrarModalExportar = true" :disabled="historial.length === 0">
        Exportar a Excel
      </button>
      <button @click="adelantarTiempo" :disabled="contadores.length === 0">
        Adelantar Tiempo
      </button>
      <button @click="iniciarCuentaRegresiva" :disabled="contadores.length === 0 || cuentaRegresivaActiva">
        Iniciar Cuenta Regresiva
      </button>
    </div>

    <div class="global-timer">
      <h2>Tiempo Global Restante: {{ formatTime(tiempoGlobalRestante) }}</h2>
    </div>

    <div class="contadores">
      <div v-for="contador in contadores" :key="contador.id" 
      class="contador" :style="{ backgroundColor: contador.color }">
        <p><strong>{{ contador.nombre }}</strong></p>
        <div class="increment-buttons">
          <button @click="incrementarCategoria(contador.id, 'livianos')">Livianos ({{ contador.livianos }})</button>
          <button @click="incrementarCategoria(contador.id, 'pesados')">Pesados ({{ contador.pesados }})</button>
          <button @click="incrementarCategoria(contador.id, 'autobuses')">Autobuses ({{ contador.autobuses }})</button>
        </div>
        <button @click="eliminarContador(contador.id)" class="eliminar">Eliminar</button>
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
  </div>
</template>

<script>
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      contadores: JSON.parse(localStorage.getItem('contadores')) || [],
      historial: JSON.parse(localStorage.getItem('historial')) || [],
      siguienteId: JSON.parse(localStorage.getItem('siguienteId')) || 1,
      intervalos: {},
      mostrarModal: false,
      mostrarModalExportar: false,
      nuevoNombre: "",
      nuevoColor: "#FFB3BA", // Color por defecto
      nombreArchivo: "",
      errorMensaje: "",
      cuentaRegresivaActiva: false,
      temporizadorGlobal: null,
      tiempoGlobalRestante: 900, // Tiempo global inicial (15 minutos)
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
      this.nuevoColor = "#FFB3BA"; // Restablecer color por defecto
      this.errorMensaje = "";
      this.mostrarModal = false;
    },
    cerrarModal() {
      this.nuevoNombre = "";
      this.nuevoColor = "#FFB3BA"; // Restablecer color por defecto
      this.errorMensaje = "";
      this.mostrarModal = false;
    },
    cerrarModalExportar() {
      this.nombreArchivo = "";
      this.mostrarModalExportar = false;
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
    eliminarContador(id) {
      const index = this.contadores.findIndex(c => c.id === id);
      if (index !== -1) {
        this.contadores.splice(index, 1);
        this.guardarDatos();
      }

      // Si ya no hay contadores, detener el temporizador global y reiniciar el tiempo
      if (this.contadores.length === 0) {
        this.detenerTemporizadorGlobal();
        this.tiempoGlobalRestante = 900; // 15 minutos
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
      this.reiniciarCuentaRegresiva();
    }

    this.guardarDatos();
  }, 1000);
},
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
    adelantarTiempo() {
      this.tiempoGlobalRestante = 5;
      this.contadores.forEach(contador => {
        contador.tiempoRestante = 5;
      });
      this.guardarDatos();
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
    exportarExcel() {
      if (this.historial.length === 0) return;

      const libro = XLSX.utils.book_new();
      this.contadores.forEach(contador => {
        const data = this.historial.filter(entry => entry["Nombre del contador"] === contador.nombre);
        const hoja = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(libro, hoja, contador.nombre);
      });

      const fecha = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
      const nombreArchivoFinal = this.nombreArchivo.trim() ? this.nombreArchivo.trim() : `historial_contadores_${fecha}`;
      XLSX.writeFile(libro, `${nombreArchivoFinal}.xlsx`);
      this.cerrarModalExportar();
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
  border: 1px solid #000;
  padding: 10px;
  text-align: center;
  border-radius: 8px;
}

.increment-buttons {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.increment-buttons button {
  padding: 5px;
  font-size: 14px;
  border: 1px solid #000;
  cursor: pointer;
  border-radius: 8px;
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

.modal {
  background: white;
  padding: 20px;
  border: 1px solid #000;
  text-align: center;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.color-picker label {
  width: 30px;
  height: 30px;
  border-radius: 30%;
  cursor: pointer;
  border: 12px solid transparent;
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
}
</style>
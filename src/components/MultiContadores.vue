<template>
  <div class="container">
      <h1>Multicontadores</h1>
      <div class="button-group">
          <button @click="mostrarModal = true" :disabled="contadores.length >= 12">
              Agregar Contador
          </button>
          <button @click="exportarExcel" :disabled="historial.length === 0">
              Exportar a Excel
          </button>
          <button @click="adelantarTiempo" :disabled="contadores.length === 0">
              Adelantar Tiempo
          </button>
      </div>

      <div class="contadores">
          <div v-for="contador in contadores" :key="contador.id" class="contador">
              <p><strong>{{ contador.nombre }}</strong></p>
              <p>Tiempo restante: {{ formatTime(contador.tiempoRestante) }}</p>
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
              <p v-if="errorMensaje" class="error">{{ errorMensaje }}</p>
              <div class="modal-buttons">
                  <button @click="confirmarNombre">Aceptar</button>
                  <button @click="cerrarModal">Cancelar</button>
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
          nuevoNombre: "",
          errorMensaje: "" // 🚨 NUEVA VARIABLE PARA MOSTRAR ERROR
      };
  },
  methods: {
      confirmarNombre() {
          if (!this.nuevoNombre.trim()) {
              this.errorMensaje = "El nombre no puede estar vacío.";
              return;
          }

          // 🔥 Verifica si el nombre ya existe
          if (this.contadores.some(c => c.nombre.toLowerCase() === this.nuevoNombre.toLowerCase())) {
              this.errorMensaje = "Ya existe un contador con este nombre.";
              return;
          }

          this.agregarContador(this.nuevoNombre.trim());
          this.nuevoNombre = "";
          this.errorMensaje = "";
          this.mostrarModal = false;
      },
      cerrarModal() {
          this.nuevoNombre = "";
          this.errorMensaje = "";
          this.mostrarModal = false;
      },
      agregarContador(nombre) {
          if (this.contadores.length < 12) {
              const horaActual = new Date();
              const inicio = this.formatHour(horaActual);
              const fin = this.formatHour(new Date(horaActual.getTime() + 15 * 60000));
              const nuevoContador = {
                  id: this.siguienteId++,
                  nombre,
                  tiempoRestante: 900,
                  livianos: 0,
                  pesados: 0,
                  autobuses: 0,
                  intervalo: `${inicio} - ${fin}`
              };
              this.contadores.push(nuevoContador);
              this.iniciarTemporizador(nuevoContador.id);
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
              clearInterval(this.intervalos[id]);
              delete this.intervalos[id];
              this.contadores.splice(index, 1);
              this.guardarDatos();
          }
      },
      iniciarTemporizador(id) {
          if (this.intervalos[id]) clearInterval(this.intervalos[id]);

          this.intervalos[id] = setInterval(() => {
              const index = this.contadores.findIndex(c => c.id === id);
              if (index !== -1) {
                  if (this.contadores[index].tiempoRestante > 0) {
                      this.contadores[index].tiempoRestante--;
                  } else {
                      this.guardarEnHistorial(id, this.contadores[index].intervalo);
                      const horaActual = new Date();
                      const nuevoInicio = this.formatHour(horaActual);
                      const nuevoFin = this.formatHour(new Date(horaActual.getTime() + 15 * 60000));
                      this.contadores[index].tiempoRestante = 900;
                      this.contadores[index].livianos = 0;
                      this.contadores[index].pesados = 0;
                      this.contadores[index].autobuses = 0;
                      this.contadores[index].intervalo = `${nuevoInicio} - ${nuevoFin}`;
                      this.guardarDatos();
                  }
              }
          }, 1000);
      },
      adelantarTiempo() {
          this.contadores.forEach(contador => {
              contador.tiempoRestante = 5;
          });
          this.guardarDatos();
      },
      guardarEnHistorial(id, intervaloAnterior) {
          const contador = this.contadores.find(c => c.id === id);
          if (contador) {
              this.historial.push({
                  Intervalo: intervaloAnterior,
                  "Nombre del contador": contador.nombre,
                  Livianos: contador.livianos,
                  Pesados: contador.pesados,
                  Autobuses: contador.autobuses,
                  Total: contador.livianos + contador.pesados + contador.autobuses
              });
              localStorage.setItem('historial', JSON.stringify(this.historial));
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
          XLSX.writeFile(libro, `historial_contadores_${fecha}.xlsx`);
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
      }
  },
  mounted() {
      this.contadores.forEach(contador => this.iniciarTemporizador(contador.id));
  }
};
</script>

<style>
.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
}
</style>

// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import MultiContadores from '../components/MultiContadores.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginForm,
  },
  {
    path: '/contadores',
    name: 'MultiContadores',
    component: MultiContadores,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
    const autenticado = sessionStorage.getItem('autenticado') === 'true';
  
    if (to.path === '/contadores' && !autenticado) {
      next('/'); // redirige a login si no está autenticado
    } else {
      next(); // permite la navegación
    }
  });
  
export default router;

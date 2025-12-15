// ====================
// IMPORTS (always at top)
// ====================
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { createPinia } from 'pinia';

// Bootstrap CSS/JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@popperjs/core';

import 'leaflet/dist/leaflet.css';

import axios from 'axios';

// ====================
// CREATE APP
// ====================
const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Plugins
app.use(router);
app.use(VueSweetalert2);

// Provide base URL globally
app.provide('baseUrl', 'http://127.0.0.1:8000/api');
//app.provide('baseUrl', 'http://188.1.5.165:8000/api');


// Mount app
app.mount('#app');

// ====================
// AXIOS GLOBAL SETUP
// ====================
// Ensure axios uses the same API host as provided to the app
axios.defaults.baseURL = "http://127.0.0.1:8000/api";
//axios.defaults.baseURL = "http://188.1.5.165:8000/api";

axios.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

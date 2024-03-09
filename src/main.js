import Vue from 'vue'
import App from './App.vue'
import VueRouter from "vue-router";
import router from './routes/router.js'
import '@/assets/main.css'
import './registerServiceWorker'

Vue.use(VueRouter)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

Vue.config.productionTip = false
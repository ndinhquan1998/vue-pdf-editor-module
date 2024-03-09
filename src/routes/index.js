import { createRouter, createWebHashHistory } from 'vue-router'
import InAppEditor from '../components/InAppEditor.vue'

const routes = [
  { path: '/', component: InAppEditor },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
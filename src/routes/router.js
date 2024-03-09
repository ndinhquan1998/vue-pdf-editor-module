import VueRouter from "vue-router";
import InAppEditor from '../components/InAppEditor.vue'

const routes = [
  {
    path: "/",
    name: "InAppEditor",
    component: InAppEditor,
  },
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

router.onError((error) => {
  if (error.name === "ChunkLoadError") console.log("store.dispatch");
});

export default router;
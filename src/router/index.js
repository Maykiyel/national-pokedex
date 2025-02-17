import Vue from "vue";
import VueRouter from "vue-router";
import PokemonList from "../views/PokemonList.vue";
import PokemonDetails from "../views/PokemonDetails.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/", name: "PokemonList", component: PokemonList },
  {
    path: "/pokemon/:id",
    name: "PokemonDetails",
    component: PokemonDetails,
    props: true,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;

import Vue from 'vue'
// import Vue from 'vue/dist/vue.esm.js'
import VueRouter from 'vue-router'

import ParcelVue from './components/parcel'
import Home from './components/Home'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'parcel',
    component: ParcelVue
  },
  {
    path: '/home',
    name: 'home',
    component: Home
  }
]

const router = new VueRouter({ routes: routes });

router.beforeEach((to, from, next) => {
  next();
})

router.afterEach(() => {
  window.scrollTo(0, 0);
})

export default router;

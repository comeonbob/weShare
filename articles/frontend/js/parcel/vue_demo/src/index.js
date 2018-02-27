import Vue from 'vue'
// import Vue from 'vue//dist/vue.esm.js'
import App from './App'
import router from './router'

// import './index.less'


new Vue({
  router,
  el: '#myapp',
  // template: '<App/>',
  // components: {
  //   App
  // }
  render: h => h(App)
})


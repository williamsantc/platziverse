import Vue from 'vue'
import App from './App.vue'

import Agent from './components/agent.vue'
import Metric from './components/metric.vue'

Vue.component('agent', Agent)
Vue.component('metric', Metric)

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: h => h(App)
})

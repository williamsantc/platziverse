<template>
  <div class="metric">
    <h3 class="metric-type">{{ type }}</h3>
    <line-chart
      :chart-data="datacollection"
      :options="{ responsive: true }"
      :width="400" :height="200"
    ></line-chart>
    <p v-if="error">{{error}}</p>
  </div>
</template>
<style>
  .metric {
    border: 1px solid white;
    margin: 0 auto;
  }
  .metric-type {
    font-size: 28px;
    font-weight: normal;
    font-family: 'Roboto', sans-serif;
  }
  canvas {
    margin: 0 auto;
  }
</style>
<script>
import axios from 'axios'
import moment from 'moment'
import randomColor  from 'random-material-color'
import LineChart from './line-chart'
import { serverUrl } from '../config'

export default {
  name: 'metric',
  components: {
    LineChart
  },
  props: [ 'uuid', 'type', 'socket' ],
  data() {
    return {
      datacollection: {},
      error: null,
      color: null
    }
  },
  mounted() {
    this.initialize()
  },
  methods: {
    async initialize() {
      const { uuid, type } = this
      this.color = randomColor.getColor()
      let result
      try {
        result = await axios.get(`${serverUrl}/metrics/${uuid}/${type}`)
      } catch(e) {
        this.error = e.error.error
        return
      }
      const labels = []
      const data = []
      const metrics = result.data
      if (Array.isArray(metrics)) {
        metrics.forEach(m => {
          labels.push(moment(m.createdAt).format('HH:mm:ss'))
          data.push(m.value)
        })
      }
      this.datacollection = {
        labels, datasets: [{
          backgroundColor: this.color,
          label: type,
          data
        }]
      }
      this.startRealtime()
    },
    startRealtime () {
      const { type, uuid, socket } = this
      socket.on('agent/message', payload => {
        if (payload.agent.uuid === uuid) {
          // Buscando el primer elemento
          const metric = payload.metrics.find(m => m.type === type)
          // Copia de los valores actuales
          const labels = this.datacollection.labels
          const data = this.datacollection.datasets[0].data
          // Removiendo el primer elemento si es mayor que 20
          const lenght = labels.lenght || data.lenght
          if (lenght >= 20) {
            labels.shift()
            data.shift()
          }
          // Agregando nuevos elementos
          labels.push(moment(metric.createdAt).format('HH:mm:ss'))
          data.push(metric.value)
          this.datacollection = {
            labels,
            datasets: [{
              backgroundColor: this.color,
              label: type,
              data
            }]
          }
        }
      })
    },
    handleError (err) {
      this.error = err.message
    }
  }
}
</script>
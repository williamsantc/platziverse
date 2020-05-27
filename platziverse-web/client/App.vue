<template>
  <div>
    <agent v-for="agent in agents" :uuid="agent.uuid" :key="agent.uuid" :socket="socket"></agent>
    <p v-if="error">{{error}}</p>
  </div>
</template>

<style>
body {
  font-family: Arial;
  background: #f8f8f8;
  margin: 0;
}
</style>

<script>
import axios from 'axios'
import io from 'socket.io-client'
import { serverUrl } from './config'

const socket = io.connect();
export default {
  data() {
    return {
      agents: [],
      error: null,
      socket
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      let result;
      try {
        result = await axios.get(`${serverUrl}/agents`);
      } catch (e) {
        console.log(e)
        this.error = e.error;
        return;
      }
      this.agents = result.data;
      socket.on("agent/connected", payload => {
        const { uuid } = payload.agent;
        const existing = this.agents.find(a => a.uuid === uuid);
        if (!existing) {
          this.agents.push(payload.agent);
        }
      });
    }
  }
}
</script>
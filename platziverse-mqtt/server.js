'use strict'

const debug = require('debug')('platziverse:mqtt')
const chalk = require('chalk')
const db = require('platziverse-db')
const aedes = require('aedes')()
const server = require('net').createServer(aedes.handle)
const { config: dbConfig } = require('platziverse-common/data/db')
const { handleError, handleFatalError } = require('platziverse-common/data/error-handling')
const { parsePayload } = require('platziverse-common/utils/events')

const port = 1883
const clients = new Map()

let Agent, Metric

server.listen(port, async function () {
  const services = await db(dbConfig).catch(handleFatalError)

  Agent = services.Agent
  Metric = services.Metric

  debug(`server is running on ${port}`)
})

aedes.on('client', client => {
  debug(`Client Connected: ${client.id}`)
  clients.set(client.id, null)
})

aedes.on('clientDisconnect', async (client) => {
  debug(`Client Disconnected: ${client.id}`)
  const agent = clients.get(client.id)
  if (agent) {
    // Mark agent as Disconnected
    agent.connected = false
    try {
      await Agent.createOrUpdate(agent)
    } catch (e) {
      return handleError(e)
    }

    clients.delete(client.id)
    aedes.publish({
      topic: 'agent/disconnected',
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    }, (err) => {
      if (err) {
        return handleError(err)
      }
      debug(`Client (${client.id}) associated to agent (${agent.uuid}) marked as disconnected`)
    })
  }
})

aedes.on('publish', async (packet, client) => {
  if (!packet.topic.startsWith('agent/')) {
    return
  }
  debug(`Topic: ${packet.topic}`)

  switch (packet.topic) {
    case 'agent/connected':
    case 'agent/disconnected':
      debug(`Payload: ${packet.payload}`)
      break
    case 'agent/message': {
      const payload = parsePayload(packet.payload)
      if (payload) {
        // debug(`Payload: ${JSON.stringify(payload)}`)
        payload.agent.connected = true
        let agent
        try {
          agent = await Agent.createOrUpdate(payload.agent)
        } catch (e) {
          return handleError(e)
        }
        debug(`Agent ${agent.uuid} saved`)
        // Notify Agent is connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent)
          aedes.publish({
            topic: 'agent/connected',
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                username: agent.username,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          })
        }
        const metricInsersionPromises = payload.metrics.map(metric => Metric.create(agent.uuid, metric))
        let metrics
        try {
          metrics = await Promise.all(metricInsersionPromises)
        } catch (e) {
          return handleError(e)
        }
        metrics.forEach(m => debug(`Metric type: (${m.type}) saved on agent (${agent.uuid})`))
      }
      break
    }
  }
})

aedes.on('clientError', handleFatalError)

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

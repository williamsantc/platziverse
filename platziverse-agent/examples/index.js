'use strict'

const debug = require('debug')('platziverse:agent')
const PlatziverseAgent = require('../')

const agent = new PlatziverseAgent({
    name: 'myApp',
    username: 'admin',
    interval: 2000
})

agent.addMetric('rss', function getRss() {
    return process.memoryUsage().rss
})

agent.addMetric('cpuUser', function getRss() {
    return process.cpuUsage().user
})

agent.addMetric('cpuSystem', function getRss() {
    return process.cpuUsage().system
})

agent.addMetric('fsRead', function getRandomPromise() {
    return Promise.resolve(process.resourceUsage().fsRead)
})

agent.addMetric('callbackMetric', function getRandomCallback(callback) {
    setTimeout(() => {
        callback(null, Math.random())
    }, 1000)
})

agent.on('connected', (clientId) => {
    debug(`Client connected: ${clientId}`)
})
agent.on('disconnected', (clientId) => {
    debug(`Client disconnected: ${clientId}`)
})
agent.on('message', (payload) => {
    debug('local message', payload)
})

agent.connect()

setTimeout(() => {
    agent.disconnect()
}, 20000);
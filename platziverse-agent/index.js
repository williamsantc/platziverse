'use strict'

const mqtt = require('mqtt')
const defaults = require('defaults')
const uuid = require('uuid')
const os = require('os')
const { promisify } = require('util')
const EventEmiter = require('events')

const { parsePayload } = require('platziverse-common/utils/events')

const defaultOptions = {
    name: 'untitled',
    username: 'platzi',
    interval: 5000,
    mqtt: {
        host: 'mqtt://localhost'
    }
}

async function wrapMetricFunction(type, fn) {
    if(fn.length === 1) {
        fn = promisify(fn)
    }
    const value = await fn()
    return { type, value }
}

class PlatziverseAgent extends EventEmiter {
    constructor(opts) {
        super()

        this._options = defaults(opts, defaultOptions)
        this._started = false
        this._timer = null
        this._client = null
        this._agentId = null
        this._metrics = new Map()
    }

    addMetric(type, fn) {
        this._metrics.set(type, fn)
    }

    removeMetric(type) {
        this._metrics.delete(type)
    }

    connect() {
        if (!this._started) {
            const opts = this._options
            this._client = mqtt.connect(opts.mqtt.host)
            this._started = true

            this._client.subscribe('agent/message')
            this._client.subscribe('agent/connected')
            this._client.subscribe('agent/disconnected')

            this._client.on('connect', () => {
                this._agentId = uuid.v4()
                this.emit('connected', this._agentId)
                this._timer = setInterval(async () => {
                    if (this._metrics.size > 0) {
                        const message = {
                            agent: {
                                uuid: this._agentId,
                                username: opts.username,
                                name: opts.name,
                                hostname: os.hostname() || 'localhost',
                                pid: process.pid
                            },
                            metrics: [],
                            timestamp: new Date().getTime()
                        }
                        message.metrics = await Promise.all(
                            Array.from(this._metrics.keys())
                                .map(metric => wrapMetricFunction(metric, this._metrics.get(metric)))
                        )
                        this._client.publish('agent/message', JSON.stringify(message))
                        this.emit('message', message)
                    }
                }, opts.interval)
            })
            this._client.on('message', (topic, payload) => {
                payload = parsePayload(payload)

                let broadcast = false
                switch (topic) {
                    case 'agent/connected':
                    case 'agent/disconnected':
                    case 'agent/message':
                        broadcast = payload && payload.agent && payload.agent.uuid !== this._agentId
                        break
                }

                if (broadcast) {
                    this.emit(topic, payload)
                }
            })

            this._client.on('error', () => this.disconnect())
        }
    }

    disconnect() {
        if (this._started) {
            clearInterval(this._timer)
            this._started = false
            this.emit('disconnected', this._agentId)
            this._client.end()
        }
    }
}

module.exports = PlatziverseAgent


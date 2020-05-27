'use strict'

const debug = require('debug')('platziverse:web')
const express = require('express')
const chalk = require('chalk')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const { handleFatalError } = require('platziverse-common/data/error-handling')
const { pipeEvent } = require('platziverse-common/utils/events')
const PlatziverseAgent = require('platziverse-agent')

const apiProxy = require('./proxy')

const port = process.env.PORT || 8080
const www = process.env.WWW || 'public'

const app = express()
const server = http.Server(app)
const io = socketio(server)
const agent = new PlatziverseAgent()

app.use(express.static(path.join(__dirname, www)))
debug(`serving ${www}`)
app.use('/', apiProxy)


app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  res.status(500).send({ error: err.message })
})

// Socket.io / WebSockets
io.on('connect', socket => {
  debug(`socket client connected: ${chalk.green(socket.id)}`)

  pipeEvent(agent, socket)
})

process.on('uncaughtException', handleFatalError)
process.on('unhandledRejection', handleFatalError)

server.listen(port, () => {
  debug(`listening on port ${chalk.green(port)}`)
  agent.connect()
})

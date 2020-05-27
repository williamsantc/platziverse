'use strict'

const express = require('express')
const chalk = require('chalk')
const debug = require('debug')('platziverse:api')

const agentsApi = require('./api/routes/agents')
const metricsApi = require('./api/routes/metrics')

const port = process.env.PORT || 3000
const app = express()

app.use('/api', agentsApi)
app.use('/api', metricsApi)

// Express error handler
app.use((err, req, res, next) => {
  debug(`Error: ${err.message}`)

  if (err.message.match(/not found/)) {
    return res.status(404).send({ error: err.message })
  }
  res.status(500).send({ error: err.message })
})

function handleFatalError (err) {
  console.error(`${chalk.red('[Error fatal]:')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

if (!module.parent) {
  process.on('uncaughtException', handleFatalError)
  process.on('unhandledRejection', handleFatalError)

  app.listen(port, () => {
    debug(`Server listening on port ${chalk.green(port)}`)
  })
}

module.exports = app

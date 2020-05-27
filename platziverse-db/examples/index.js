'use strict'

const db = require('../')
const chalk = require('chalk')
const debug = require('debug')('platziverse:db:example')
const { config } = require('platziverse-common/data/db')

async function run () {
  const exampleConfig = {
    ...config,
    logging: m => debug(m)
  }

  const { Agent, Metric } = await db(exampleConfig).catch(handleFatalError)
  const agent = await Agent.createOrUpdate({
    uuid: 'yyy-yyy-yyy',
    name: 'test',
    username: 'platzi',
    hostname: 'test-host',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  debug('--agent--')
  debug(agent)

  const agents = await Agent.findAll().catch(handleFatalError)
  debug('--agents--')
  debug(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  debug('--agent metric--')
  debug(metric)

  const metricsByUuid = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)
  debug('--metrics by agent uuid --')
  debug(metricsByUuid)

  const metricsByTypeAndAgentUuid = await Metric.findByTypeAndAgentUuid(metric.type, agent.uuid).catch(handleFatalError)

  debug('--metrics by type and agent uuid --')
  debug(metricsByTypeAndAgentUuid)

  process.exit(0)
}

function handleFatalError (err) {
  console.error(`${chalk.red('[error fatal]')} ${err.message}`)
  console.error(err.stack)
  process.exit(1)
}

run()

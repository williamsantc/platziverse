'use strict'

const express = require('express')
const getServices = require('../services')
const debug = require('debug')('platziverse:api:agents')
const auth = require('express-jwt')
const { secret } = require('platziverse-common/data/auth')

const router = express.Router()

let Agent

router.use('*', async (req, res, next) => {
  const { Agent: _Agent } = await getServices()
  Agent = _Agent
  next()
})

router.get('/agents', auth({ secret }), async (req, res, next) => {
  debug('Incoming request to /agents')

  if (!req.user) {
    return next(new Error('Unathorized'))
  }
  let agents = []

  try {
    if (req.user.admin) {
      agents = await Agent.findConnected()
    } else {
      agents = await Agent.findByUsername(req.user.username)
    }
  } catch (e) {
    return next(e)
  }
  res.send(agents)
})

router.get('/agents/:uuid', async (req, res, next) => {

  const { uuid } = req.params
  debug(`Incoming request to /agents/${uuid}`)

  let agent
  try {
    agent = await Agent.findByUuid(uuid)
  } catch (e) {
    return next(e)
  }
  if (!agent) {
    return next(new Error(`Agent not found with uuid: ${uuid}`))
  }
  res.send(agent)
})

module.exports = router

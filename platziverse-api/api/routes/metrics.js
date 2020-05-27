'use strict'

const express = require('express')
const getServices = require('../services')
const debug = require('debug')('platziverse:api:metrics')
const auth = require('express-jwt')
const { secret } = require('platziverse-common/data/auth')
const gard = require('express-jwt-permissions')()

const router = express.Router()

let Metric

router.use('*', async (req, res, next) => {
  const { Metric: _Metric } = await getServices()
  Metric = _Metric
  next()
})

router.get('/metrics/:uuid', auth({ secret }), gard.check(['metrics:read']), async (req, res, next) => {
  const { uuid } = req.params
  debug(`Incoming request to /metrics/${uuid}`)
  let metrics
  try {
    metrics = await Metric.findByAgentUuid(uuid)
  } catch (e) {
    return next(e)
  }

  if (!metrics || metrics.length === 0) {
    return next(new Error(`Metric types not found for agent uuid: ${uuid}`))
  }
  res.send(metrics)
})

router.get('/metrics/:uuid/:type', async (req, res, next) => {
  const { uuid, type } = req.params
  debug(`Incoming request to /metrics/${uuid}/${type}`)
  let metrics
  try {
    metrics = await Metric.findByTypeAndAgentUuid(type, uuid)
  } catch (e) {
    return next(e)
  }
  if (!metrics || metrics.length === 0) {
    return next(new Error(`${type} metrics not found for agent uuid: ${uuid}`))
  }
  res.send(metrics)
})

module.exports = router

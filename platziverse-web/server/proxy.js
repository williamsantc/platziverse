'use strict'

const express = require('express')
const axios = require('axios')

const { endpoint, apiToken } = require('platziverse-common/data/api')

const api = express.Router()

const options = {
  headers: {
    Authorization: `Bearer ${apiToken}`
  }
}

api.get('/agents', async (req, response, next) => {
  let result
  try {
    result = await axios.get(`${endpoint}/api/agents`, options)
  } catch (e) {
    return next(e)
  }

  response.send(result.data)
})

api.get('/agents/:uuid', async (req, response, next) => {
  const { uuid } = req.params

  let result
  try {
    result = await axios.get(`${endpoint}/api/agents/${uuid}`, options)
  } catch (e) {
    return next(e)
  }

  response.send(result.data)
})

api.get('/metrics/:uuid', async (req, response, next) => {
  const { uuid } = req.params

  let result
  try {
    result = await axios.get(`${endpoint}/api/metrics/${uuid}`, options)
  } catch (e) {
    return next(e)
  }

  response.send(result.data)
})

api.get('/metrics/:uuid/:type', async (req, response, next) => {
  const { uuid, type } = req.params

  let result
  try {
    result = await axios.get(`${endpoint}/api/metrics/${uuid}/${type}`, options)
  } catch (e) {
    return next(e)
  }

  response.send(result.data)
})

module.exports = api

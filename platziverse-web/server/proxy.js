'use strict'

const express = require('express')
const axios = require('axios')

const { endpoint, apiToken } = require('platziverse-common/data/api')

const api = express.Router()

const options = {
  headers: {
    Authorization: `Bearer ${apiToken}`
  },
}

api.get('/agents', async (req, response, next) => {

  let result
  try {
    result = await axios.get(`${endpoint}/api/agents`, options)
  } catch (e) {
    console.log(e)
    return next(e)
  }
  
  response.send(result)
 })

api.get('/agents/:uuid', (req, response) => { })

api.get('/metrics/:uuid', (req, response) => { })

api.get('/metrics/:uuid/:type', (req, response) => { })

module.exports = api
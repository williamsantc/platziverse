'use strict'

const db = require('./db')
const auth = require('./auth')
const errorHandling = require('./error-handling')
const api = require('./api')

module.exports = {
  db,
  auth,
  errorHandling,
  api
}

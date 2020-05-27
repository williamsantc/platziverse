'use strict'

const db = require('platziverse-db')
const { config: dbConfig } = require('platziverse-common/data/db')
const debug = require('debug')('platziverse:api:services')

let services

async function getServices () {
  if (!services) {
    debug('Conecting to database...')
    services = await db(dbConfig)
  }
  return services
}

module.exports = getServices

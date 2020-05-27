'use strict'

const test = require('ava')
const request = require('supertest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('platziverse-common/fixtures/agent')
const { promisify } = require('util')
const { secret } = require('platziverse-common/data/auth')
const auth = require('../api/auth')

const sign = promisify(auth.sign)

let sandbox = null
let app = null
let servicesStub = null
let AgentStub = null
let MetricStub = null

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()
  AgentStub = {
    findByUuid: sandbox.stub(),
    findConnected: sandbox.stub(),
    findByUsername: sandbox.stub()
  }

  MetricStub = {
    findByAgentUuid: sandbox.stub(),
    findByTypeAndAgentUuid: sandbox.stub()
  }

  servicesStub = sandbox.stub()

  servicesStub.returns(Promise.resolve({
    Agent: AgentStub,
    Metric: MetricStub
  }))

  const agentApi = proxyquire('../api/routes/agents', {
    '../services': servicesStub
  })

  const metricApi = proxyquire('../api/routes/metrics', {
    '../services': servicesStub
  })

  app = proxyquire('../server', {
    './api/routes/agents': agentApi,
    './api/routes/metrics': metricApi
  })
})

test.afterEach(() => {
  if (sandbox) {
    sandbox.restore()
  }
})

test.serial('/api/agents admin', async t => {
  const token = await sign({ admin: true, username: 'test' }, secret)
  AgentStub.findConnected.returns(Promise.resolve(agentFixtures.connected()))
  const res = await request(app)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)

  const body = JSON.stringify(res.body)
  const expected = JSON.stringify(agentFixtures.connected())
  t.deepEqual(body, expected, 'response body should be the expected')
})

test.serial('/api/agents username platzi', async t => {
  const username = 'platzi'
  const token = await sign({ admin: false, username }, secret)
  AgentStub.findByUsername.withArgs(username).returns(Promise.resolve(agentFixtures.platziAgents()))
  const res = await request(app)
    .get('/api/agents')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/)

  const body = JSON.stringify(res.body)
  const expected = JSON.stringify(agentFixtures.platziAgents())
  t.deepEqual(body, expected, 'response body should be the expected')
})

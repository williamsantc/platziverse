'use strict'

const test = require('ava')
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const agentFixtures = require('platziverse-common/fixtures/agent')

const config = {
  logging: () => { }
}

let MetricStub = null
let AgentStub = null
let db = null
let sandBox = null

test.beforeEach(async () => {
  sandBox = sinon.createSandbox()
  AgentStub = {
    hasMany: sandBox.stub(),
    findById: sandBox.stub(),
    findOne: sandBox.stub(),
    update: sandBox.stub(),
    create: sandBox.stub()
  }

  MetricStub = {
    belongsTo: sandBox.spy()
  }

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test('make it pass', t => {
  t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', async t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'AgentModel.hasMany argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'MetricModel.belongsTo argument should be the AgentModel')
})

test.serial('Agent#findById', async t => {
  // Arrange
  const id = 1
  AgentStub.findById.withArgs(id).callsFake(async id => agentFixtures.byId(id))

  const expectedAgent = agentFixtures.byId(id)

  // Act
  const agent = await db.Agent.findById(id)

  // Assert
  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called on model once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called on model with id')
  t.deepEqual(agent, expectedAgent, 'Should be the same')
})

test.serial('Agent#findOrCreate', async t => {
  // Arrange
  const expectedAgent = agentFixtures.single()
  const uuid = expectedAgent.uuid
  const queryObject = {
    where: { uuid: uuid }
  }
  const expectedFindOneCount = 2
  AgentStub.findOne.onFirstCall().returns(Promise.resolve(expectedAgent))
  AgentStub.update.returns(Promise.resolve([1]))
  AgentStub.findOne.onSecondCall().returns(Promise.resolve(expectedAgent))

  // Act
  const agent = await db.Agent.createOrUpdate(expectedAgent)

  // Assert
  t.deepEqual(agent, expectedAgent, 'should be the same')
  t.true(AgentStub.update.calledOnce, 'uptade should be called once on model')
  t.is(AgentStub.findOne.callCount, expectedFindOneCount, 'should call 2 times findOne method on model')
  t.deepEqual(AgentStub.findOne.getCall(0).args, [queryObject], 'call args 0 should be expected on findOne method on model')
  t.deepEqual(AgentStub.findOne.getCall(1).args, [queryObject], 'call args 1 should be expected on findOne method on model')
})

test.afterEach(() => {
  if (sandBox) {
    sandBox.restore()
  }
})

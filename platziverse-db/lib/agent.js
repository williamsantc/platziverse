'use strict'

module.exports = function setUpAgent (AgentModel) {
  async function createOrUpdate (agent) {
    const queryObject = {
      where: { uuid: agent.uuid }
    }
    const agentFound = await AgentModel.findOne(queryObject)

    if (agentFound) {
      const [signal] = await AgentModel.update(agent, queryObject)
      return signal ? await AgentModel.findOne(queryObject) : agentFound
    }
    return (await AgentModel.create(agent)).toJSON()
  }

  function findById (id) {
    return AgentModel.findById(id)
  }

  function findByUuid (uuid) {
    return AgentModel.findOne({
      where: { uuid }
    })
  }

  function findAll () {
    return AgentModel.findAll()
  }

  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }

  function findByUsername (username) {
    return AgentModel.findAll({
      where: { username, connected: true }
    })
  }

  return {
    findById,
    createOrUpdate,
    findByUuid,
    findAll,
    findConnected,
    findByUsername
  }
}

'use strict'

module.exports = function setupMetric (MetricModel, AgentModel) {
  async function create (uuid, metric) {
    const agent = await AgentModel.findOne({ where: { uuid } })

    if (agent) {
      Object.assign(metric, { agentId: agent.id })
      return (await MetricModel.create(metric)).toJSON()
    }
  }

  function findByAgentUuid (uuid) {
    return MetricModel.findAll({
      attributes: ['type'],
      group: ['type'],
      include: [{
        attributes: [],
        model: AgentModel,
        where: {
          uuid
        }
      }],
      raw: true
    })
  }

  function findByTypeAndAgentUuid (type, uuid) {
    return MetricModel.findAll({
      attributes: ['id', 'type', 'value', 'createdAt'],
      where: { type },
      limit: 20,
      order: [['createdAt', 'DESC']],
      include: [{
        attributes: [],
        model: AgentModel,
        where: { uuid }
      }],
      raw: true
    })
  }

  return {
    create,
    findByAgentUuid,
    findByTypeAndAgentUuid
  }
}

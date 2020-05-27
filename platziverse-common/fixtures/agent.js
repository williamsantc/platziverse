'use strict'

const cloneDeep = require('lodash/cloneDeep')

const agent = {
  id: 1,
  uuid: 'yyy-yyy-yyy',
  name: 'fixture',
  username: 'platzi',
  hostname: 'test-host',
  pid: 0,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date()
}

function extend (obj, values) {
  return { ...obj, ...values }
}

const agents = [
  agent,
  extend(agent, { id: 2, uuid: 'yyy-yyy-yy2', connected: false }),
  extend(agent, { id: 3, uuid: 'yyy-yyy-yyx', connected: true, pid: 1, username: 'carlos' }),
  extend(agent, { id: 4, uuid: 'yey-yyy-yyx', connected: false, pid: 1, username: 'manuel' })
]

module.exports = {
  single: () => cloneDeep(agent),
  all: () => cloneDeep(agents),
  connected: () => cloneDeep(agents.filter(a => a.connected)),
  platziAgents: () => cloneDeep(agents.filter(a => a.username === 'platzi')),
  byUuid: uuid => cloneDeep(agents.filter(a => a.uuid === uuid).shift()),
  byId: id => cloneDeep(agents.filter(a => a.id === id).shift()),
  byUsername: username => cloneDeep(agents.filter(a => a.username === username))
}

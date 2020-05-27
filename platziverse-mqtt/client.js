'use strict'

const debug = require('debug')('platziverse:mqtt')
const mqtt = require('mqtt')

const client = mqtt.connect('tcp://localhost')
client.on('connect', function () {
  client.subscribe('agent/message', function (err) {
    if (!err) {
      client.publish('agent/message', JSON.stringify({
        agent: {
          uuid: 'yyy-yyy-yyx',
          name: 'fixture',
          username: 'platzi',
          hostname: 'test-host',
          pid: 0
        },
        metrics: [
          {
            type: 'ram',
            value: 300
          },
          {
            type: 'cpu',
            value: 24
          },
        ]
      }))
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  debug(message.toString())
  setTimeout(() => {
    client.end()
  }, 5000)
})

'use strict'

function parsePayload (payload) {
  if (payload instanceof Buffer) {
    payload = payload.toString('utf8')
  }
  try {
    payload = JSON.parse(payload)
  } catch {
    payload = null
  }
  return payload
}

function pipeEvent(source, target) {
  if(!source.emit || !target.emit) {
    throw TypeError('Please pass EventEmitters as arguments')
  }
  const emit = source._emit = source.emit
  source.emit = (...args) => {
    emit.apply(source, args)
    target.emit.apply(target, args)
    return source
  }
}

module.exports = {
  parsePayload,
  pipeEvent
}

'use strict'

var register = require('../register')

register(function (msg) {
  return msg
})

self.addEventListener('message', function (e) {
  if (!Array.isArray(e.data)) { // custom message, not from promise-worker
    self.postMessage(e.data)
  }
})

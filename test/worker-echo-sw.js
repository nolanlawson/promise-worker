'use strict'

var registerPromiseWorker = require('../register')

registerPromiseWorker(function (msg) {
  return msg
})

self.addEventListener('activate', function (event) {
  // activate right now
  event.waitUntil(self.clients.claim())
})

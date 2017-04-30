'use strict';

var register = require('../register');

register(function (msg) {
  return msg;
}, { disableErrorLogging: true }); // Disable error logging for tests

self.addEventListener('message', function (e) {
  if (typeof e.data !== 'string') { // custom message
    self.postMessage(e.data);
  }
});

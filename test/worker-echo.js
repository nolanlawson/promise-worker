'use strict';

var register = require('../register');

register(function (msg) {
  return msg;
}, { disableErrorLogging: true }); // Disable error logging for tests

'use strict';

var register = require('../register');
var Promise = require('lie');

register(function () {
  return Promise.resolve('pong');
}, { disableErrorLogging: true }); // Disable error logging for tests

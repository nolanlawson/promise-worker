'use strict';

var register = require('../register');

register(function () {
  return 'pong';
}, { disableErrorLogging: true }); // Disable error logging for tests

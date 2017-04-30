'use strict';

var register = require('../register');

register(function () {
  throw new Error('busted!');
}, { disableErrorLogging: true }); // Disable error logging for tests

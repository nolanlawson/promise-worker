'use strict';

var register = require('../register');

register(function (msg) {
  throw new Error('an error message');
}); // Log error for this test

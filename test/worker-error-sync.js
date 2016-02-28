'use strict';

var register = require('../register');

register(function () {
  throw new Error('busted!');
});
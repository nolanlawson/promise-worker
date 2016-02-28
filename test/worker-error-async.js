'use strict';

var register = require('../register');
var Promise = require('lie');

register(function () {
  return Promise.resolve().then(function () {
    throw new Error('oh noes');
  });
});
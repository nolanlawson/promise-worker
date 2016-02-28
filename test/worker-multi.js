'use strict';

var register = require('../register');

register({
  foo: function () {
    return 'foo'
  },
  bar: function () {
    return 'bar'
  }
});
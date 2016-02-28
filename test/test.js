'use strict';

if (!process.browser) {
  global.Worker = require('pseudo-worker');
  global.XMLHttpRequest = require('./xhr-shim');
}

describe('main test suite', function () {

  it('sends a message back and forth', function () {

    var b = browserify(__dirname + '/worker1')


  });

});

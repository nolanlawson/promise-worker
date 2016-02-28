'use strict';

if (!process.browser) {
  global.Worker = require('pseudo-worker');
  global.XMLHttpRequest = require('./xhr-shim');
}

var path = process.browser ? './test/bundle/' : './test/bundle/';

var assert = require('assert');
var PromiseWorker = require('../');

describe('main test suite', function () {

  this.timeout(60000);

  it('sends a message back and forth', function () {
    var worker = new Worker(path + 'worker-pong.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'pong');
    })
  });

  it('echoes a message', function () {
    var worker = new Worker(path + 'worker-echo.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'ping');
    })
  });

  it('echoes a message with a promise', function () {
    var worker = new Worker(path + 'worker-pong-promise.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'pong');
    })
  });

});

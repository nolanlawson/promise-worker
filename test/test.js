'use strict';

if (!process.browser) {
  global.Worker = require('pseudo-worker');
  global.XMLHttpRequest = require('./xhr-shim');
}

var path = process.browser ? './test/bundle/' : './test/bundle/';

var assert = require('assert');
var PromiseWorker = require('../');
var Promise = require('lie');

describe('main test suite', function () {

  this.timeout(60000);

  it('sends a message back and forth', function () {
    var worker = new Worker(path + 'worker-pong.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'pong');
    });
  });

  it('echoes a message', function () {
    var worker = new Worker(path + 'worker-echo.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'ping');
    });
  });

  it('pongs a message with a promise', function () {
    var worker = new Worker(path + 'worker-pong-promise.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'pong');
    });
  });

  it('pongs a message with a promise, again', function () {
    var worker = new Worker(path + 'worker-pong-promise.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.equal(res, 'pong');
    });
  });

  it('echoes a message multiple times', function () {
    var worker = new Worker(path + 'worker-echo.js');
    var promiseWorker = new PromiseWorker(worker);

    var words = [
      'foo', 'bar', 'baz',
      'quux', 'toto', 'bongo', 'haha', 'flim',
      'foob', 'foobar', 'bazzy', 'fifi', 'kiki'
    ];

    return Promise.all(words.map(function (word) {
      return promiseWorker.postMessage(word).then(function (res) {
        assert.equal(res, word);
      });
    }));
  });

  it('can have multiple PromiseWorkers', function () {
    var worker = new Worker(path + 'worker-echo.js');
    var promiseWorker1 = new PromiseWorker(worker);
    var promiseWorker2 = new PromiseWorker(worker);

    return promiseWorker1.postMessage('foo').then(function (res) {
      assert.equal(res, 'foo');
    }).then(function () {
      return promiseWorker2.postMessage('bar');
    }).then(function (res) {
      assert.equal(res, 'bar');
    });
  });


  it('can have multiple PromiseWorkers 2', function () {
    var worker = new Worker(path + 'worker-echo.js');
    var promiseWorkers = [
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker)
    ];

    return Promise.all(promiseWorkers.map(function (promiseWorker, i) {
      return promiseWorker.postMessage('foo' + i).then(function (res) {
        assert.equal(res, 'foo' + i);
      }).then(function () {
        return promiseWorker.postMessage('bar' + i);
      }).then(function (res) {
        assert.equal(res, 'bar' + i);
      });
    }));
  });

  it('handles synchronous errors', function () {
    var worker = new Worker(path + 'worker-error-sync.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('foo').then(function () {
      throw new Error('expected an error here');
    }, function (err) {
      assert.equal(err.message, 'busted!');
    });
  });

  it('handles asynchronous errors', function () {
    var worker = new Worker(path + 'worker-error-async.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('foo').then(function () {
      throw new Error('expected an error here');
    }, function (err) {
      assert.equal(err.message, 'oh noes');
    });
  });

  it('handles unregistered callbacks', function () {
    var worker = new Worker(path + 'worker-empty.js');
    var promiseWorker = new PromiseWorker(worker);

    return promiseWorker.postMessage('ping').then(function () {
      throw new Error('expected an error here');
    }, function (err) {
      assert(err);
    });
  });

  after(function () {
    // check coverage inside the worker
    if (typeof __coverage__ !== 'undefined' && !process.browser) {
      require('mkdirp').sync('coverage');
      require('fs').writeFileSync(
        'coverage/coverage-worker.json', JSON.stringify(__coverage__), 'utf-8');
    }
  });

});

'use strict'

require('lie/polyfill')

if (!process.browser) {
  global.Worker = require('pseudo-worker')
  global.XMLHttpRequest = require('./xhr-shim')
}

var path = 'bundle-'

var assert = require('assert')
var PromiseWorker = require('../')

describe('main test suite', function () {
  this.timeout(60000)

  it('sends a message back and forth', function () {
    var worker = new Worker(path + 'worker-pong.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.strictEqual(res, 'pong')
    })
  })

  it('echoes a message', function () {
    var worker = new Worker(path + 'worker-echo.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.strictEqual(res, 'ping')
    })
  })

  it('pongs a message with a promise', function () {
    var worker = new Worker(path + 'worker-pong-promise.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.strictEqual(res, 'pong')
    })
  })

  it('pongs a message with a promise, again', function () {
    var worker = new Worker(path + 'worker-pong-promise.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.strictEqual(res, 'pong')
    })
  })

  it('echoes a message multiple times', function () {
    var worker = new Worker(path + 'worker-echo.js')
    var promiseWorker = new PromiseWorker(worker)

    var words = [
      'foo', 'bar', 'baz',
      'quux', 'toto', 'bongo', 'haha', 'flim',
      'foob', 'foobar', 'bazzy', 'fifi', 'kiki'
    ]

    return Promise.all(words.map(function (word) {
      return promiseWorker.postMessage(word).then(function (res) {
        assert.strictEqual(res, word)
      })
    }))
  })

  it('can have multiple PromiseWorkers', function () {
    var worker = new Worker(path + 'worker-echo.js')
    var promiseWorker1 = new PromiseWorker(worker)
    var promiseWorker2 = new PromiseWorker(worker)

    return promiseWorker1.postMessage('foo').then(function (res) {
      assert.strictEqual(res, 'foo')
    }).then(function () {
      return promiseWorker2.postMessage('bar')
    }).then(function (res) {
      assert.strictEqual(res, 'bar')
    })
  })

  it('can have multiple PromiseWorkers 2', function () {
    var worker = new Worker(path + 'worker-echo.js')
    var promiseWorkers = [
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker),
      new PromiseWorker(worker)
    ]

    return Promise.all(promiseWorkers.map(function (promiseWorker, i) {
      return promiseWorker.postMessage('foo' + i).then(function (res) {
        assert.strictEqual(res, 'foo' + i)
      }).then(function () {
        return promiseWorker.postMessage('bar' + i)
      }).then(function (res) {
        assert.strictEqual(res, 'bar' + i)
      })
    }))
  })

  it('handles synchronous errors', function () {
    var worker = new Worker(path + 'worker-error-sync.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('foo').then(function () {
      throw new Error('expected an error here')
    }, function (err) {
      assert.strictEqual(err.message, 'busted!')
    })
  })

  it('handles asynchronous errors', function () {
    var worker = new Worker(path + 'worker-error-async.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('foo').then(function () {
      throw new Error('expected an error here')
    }, function (err) {
      assert.strictEqual(err.message, 'oh noes')
    })
  })

  it('handles unregistered callbacks', function () {
    var worker = new Worker(path + 'worker-empty.js')
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function () {
      throw new Error('expected an error here')
    }, function (err) {
      assert(err)
    })
  })

  it('allows custom additional behavior', function () {
    var worker = new Worker(path + 'worker-echo-custom.js')
    var promiseWorker = new PromiseWorker(worker)
    return Promise.all([
      promiseWorker.postMessage('ping'),
      new Promise(function (resolve, reject) {
        function cleanup () {
          worker.removeEventListener('message', onMessage)
          worker.removeEventListener('error', onError)
        }
        function onMessage (e) {
          if (typeof e.data === 'string') {
            return
          }
          cleanup()
          resolve(e.data)
        }
        function onError (e) {
          cleanup()
          reject(e)
        }
        worker.addEventListener('error', onError)
        worker.addEventListener('message', onMessage)
        worker.postMessage({ hello: 'world' })
      }).then(function (data) {
        assert.strictEqual(data.hello, 'world')
      })
    ])
  })

  after(function () {
    // check coverage inside the worker
    if (typeof __coverage__ !== 'undefined' && !process.browser) {
      require('mkdirp').sync('coverage')
      require('fs').writeFileSync(
        'coverage/coverage-worker.json', JSON.stringify(__coverage__), 'utf-8')
    }
  })
})

describe('service worker test suite', function () {
  this.timeout(60000)

  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  var worker

  before(function () {
    return navigator.serviceWorker.register(path + 'worker-echo-sw.js', {
      scope: './'
    }).then(function () {
      if (navigator.serviceWorker.controller) {
        // already active and controlling this page
        return navigator.serviceWorker
      }
      // wait for a new service worker to control this page
      return new Promise(function (resolve) {
        function onControllerChange () {
          navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
          resolve(navigator.serviceWorker)
        }
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
      })
    }).then(function (theWorker) {
      worker = theWorker
    })
  })

  it('echoes a message', function () {
    var promiseWorker = new PromiseWorker(worker)

    return promiseWorker.postMessage('ping').then(function (res) {
      assert.strictEqual(res, 'ping')
    })
  })

  it('echoes a message multiple times', function () {
    var promiseWorker = new PromiseWorker(worker)

    var words = [
      'foo', 'bar', 'baz',
      'quux', 'toto', 'bongo', 'haha', 'flim',
      'foob', 'foobar', 'bazzy', 'fifi', 'kiki'
    ]

    return Promise.all(words.map(function (word) {
      return promiseWorker.postMessage(word).then(function (res) {
        assert.strictEqual(res, word)
      })
    }))
  })
})

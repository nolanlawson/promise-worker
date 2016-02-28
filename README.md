promise-worker [![Build Status](https://travis-ci.org/nolanlawson/promise-worker.svg?branch=master)](https://travis-ci.org/nolanlawson/promise-worker) [![Coverage Status](https://coveralls.io/repos/github/nolanlawson/promise-worker/badge.svg?branch=master)](https://coveralls.io/github/nolanlawson/promise-worker?branch=master)
====

Small and performant API for communicating with Web Workers using Promises.

**Goals:**

 * Tiny footprint (~2.5kB min+gz)
 * Assumes you have a separate `worker.js` file (easier to debug, better browser support)
 * `JSON.stringify`s messages [for performance](http://blog.nparashuram.com/2016/02/using-webworkers-to-make-react-faster.html)

Usage
---

Install:

    npm install promise-worker

Inside your main bundle:

```js
// main.js
var PromiseWorker = require('promise-worker');
var worker = new Worker('worker.js');
var promiseWorker = new PromiseWorker(worker);

promiseWorker.postMessage('ping').then(function (response) {
  // handle response
}).catch(function (error) {
  // handle error
});
```

Inside your `worker.js` bundle:

```js
// worker.js
var register = require('promise-worker/register');

register(function (message) {
  return 'pong';
});
```

### Message format

The message you send can be any object, array, string, number, etc.:

```js
// main.js
promiseWorker.postMessage({
  hello: 'world',
  answer: 42,
  "this is fun": true
}).then(/* ... */);
```
 
Note that the message will be `JSON.stringify`d, so you 
can't send functions, `Date`s, custom classes, etc.

Inside of the worker, the registered handler can return either a Promise or a normal value:

```js
// worker.js
register(function (message) {
  return Promise.resolve().then(function () {
    return 'much async';
  }).then(function () {
    return 'very promise';
  });
});
```

Ultimately, the value that is sent from the worker to the main thread is also
`stringify`d, so the same rules above apply.

Also note that you `require()` two separate APIs, so that the library is split
between the `worker.js` and main file. This keep the total bundle size smaller.

### Multi-type messages

If you need to send messages of multiple types to the worker, just add some
some type information to the message you send:

```js
// main.js
promiseWorker.postMessage({
  type: 'en'
}).then(/* ... */);

promiseWorker.postMessage({
  type: 'fr'
}).then(/* ... */);
```

```js
// worker.js
register(function (message) {
  if (message.type === 'en') {
    return 'Hello!';
  } else if (message.type === 'fr') {
    return 'Bonjour!';
  }
});
```

### Error handling

Any thrown errors or asynchronous rejections from the worker will
br propagated to the main thread as a rejected Promise. For instance:

```js
// worker.js
register(function (message) {
  throw new Error('naughty!');
});
```

```js
// main.js
promiseWorker.postMessage('whoop').catch(function (err) {
  console.log(err.message); // 'naughty!'
});
```

Note that stacktraces cannot be sent from the worker to the main thread, so you
will have to debug those errors yourself. This module does however, print
message to `console.error()`, so you should see them there.

Browser support
----

See [.zuul.yml](https://github.com/nolanlawson/promise-worker/blob/master/.zuul.yml) for the full list
of tested browsers, but basically:

* Chrome
* Firefox
* Safari 7+
* IE 10+
* Edge
* iOS 7+
* Android 4.4+

If a browser [doesn't support Web Workers](http://caniuse.com/webworker) but you still want to use this library,
then you can use [PseudoWorker](https://github.com/nolanlawson/pseudo-worker).

This library is not designed to run in Node.

API
---

### Main bundle

#### `new PromiseWorker(worker)`

Create a new `PromiseWorker`, using the given worker.

* `worker` - the `Worker` or [PseudoWorker](https://github.com/nolanlawson/pseudo-worker) to use.

#### `PromiseWorker.postMessage(message)`

Send a message to the worker and return a Promise.

* `message` - object - required
  * The message to send.
* returns a Promise

### Worker bundle

Register a message handler inside of the worker. Your handler consumes a message
and returns a Promise or value.

#### `register(function)`

* `function`
  * Takes a message, returns a Promise or a value.
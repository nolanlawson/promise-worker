promise-worker [![Build Status](https://travis-ci.org/nolanlawson/promise-worker.svg?branch=master)](https://travis-ci.org/nolanlawson/promise-worker) [![Coverage Status](https://coveralls.io/repos/github/nolanlawson/promise-worker/badge.svg?branch=master)](https://coveralls.io/github/nolanlawson/promise-worker?branch=master)
====

Small and performant API for communicating with Web Workers using Promises.

**Goals:**

 * Tiny footprint (~2.5kB min+gz)
 * Assumes you have a separate `worker.js` file (easier to debug, better browser support)
 * `JSON.stringify`s messages [for performance](http://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)

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
var registerPromiseWorker = require('promise-worker/register');

registerPromiseWorker(function (message) {
  return 'pong';
});
```

Note that you `require()` two separate APIs, so the library is split
between the `worker.js` and main file. This keeps the total bundle size smaller.

If you prefer `script` tags, you can get `PromiseWorker` via:

```html
<script src="https://npmcdn.com/promise-worker/dist/promise-worker.js"></script>
```

And inside the worker, you can get `registerPromiseWorker` function via:

```js
importScripts('https://npmcdn.com/promise-worker/dist/promise-worker.register.js');
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

```js
// worker.js
registerPromiseWorker(function (message) {
  console.log(message); // { hello: 'world', answer: 42, 'this is fun': true }
});
```
 
Note that the message will be `JSON.stringify`d, so you 
can't send functions, `Date`s, custom classes, etc.

### Promises

Inside of the worker, the registered handler can return either a Promise or a normal value:

```js
// worker.js
registerPromiseWorker(function () {
  return Promise.resolve().then(function () {
    return 'much async, very promise';
  });
});
```

```js
// main.js
promiseWorker.postMessage(null).then(function (message) {
  console.log(message): // 'much async, very promise'
});
```

Ultimately, the value that is sent from the worker to the main thread is also
`stringify`d, so the same format rules apply.

### Error handling

Any thrown errors or asynchronous rejections from the worker will
be propagated to the main thread as a rejected Promise. For instance:

```js
// worker.js
registerPromiseWorker(function (message) {
  throw new Error('naughty!');
});
```

```js
// main.js
promiseWorker.postMessage('whoops').catch(function (err) {
  console.log(err.message); // 'naughty!'
});
```

Note that stacktraces cannot be sent from the worker to the main thread, so you
will have to debug those errors yourself. This library does however, print
message to `console.error()`, so you should see them there.

### Multi-type messages

If you need to send messages of multiple types to the worker, just add
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
registerPromiseWorker(function (message) {
  if (message.type === 'en') {
    return 'Hello!';
  } else if (message.type === 'fr') {
    return 'Bonjour!';
  }
});
```

Browser support
----

See [.zuul.yml](https://github.com/nolanlawson/promise-worker/blob/master/.zuul.yml) for the full list
of tested browsers, but basically:

* Chrome
* Firefox
* Safari 7+
* IE 10+
* Edge
* iOS 8+
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

#### `registerPromiseWorker(function)`

* `function`
  * Takes a message, returns a Promise or a value.


Testing the library
---

First:

    npm install

Then to test in Node (using an XHR/PseudoWorker shim):

    npm test

Or to test manually in your browser of choice:

    npm run test-local

Or to test in a browser using SauceLabs:

    npm run test-browser

Or to test in PhantomJS:

    npm run test-phantom

Or to test with coverage reports:

    npm run coverage

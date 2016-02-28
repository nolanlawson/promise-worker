promise-worker
====

Small and performant API for communicating with Web Workers using Promises.

**Goals:**

 * Tiny footprint
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

The message you send can be any object, array, string, number, etc.:

```js
// main.js
promiseWorker.postMessage({
  hello: 'world',
  answer: 42,
  "this is fun": true
}).then(function (response) {
  // handle response
}).catch(function (error) {
  // handle error
});
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

### Separate message types

If you have different types of messages that you want to send to the Web Worker,
you can also send message IDs as strings:

```js
// main.js
promiseWorker.postMessage('foo', {
  howdy: 'partner'
}).then(/* ... */);

promiseWorker.postMessage('bar', {
  sayonara: 'sucker'
}).then(/* ... */);
```

```js
// worker.js
register({
  foo: function (message) {
    return 'hello';
  },
  bar: function (message) {
    return 'goodbye';
  }
});
```

If you don't specify any message types, then it's assumed that you only have
one kind of message.

API
---

### Main bundle

#### `new PromiseWorker(worker)`

Create a new `PromiseWorker`, using the given worker.

* `worker` - the `Worker` or [PseudoWorker](https://github.com/nolanlawson/pseudo-worker) to use.

#### `PromiseWorker.postMessage([messageId, ] message)`

Send a message to the worker and return a Promise.

* `messageId` - String - optional
  * The message ID, or none if you only have one kind of message.
* `message` - object - required
  * The message to send.
* returns a Promise

### Worker bundle

Register a message handler inside of the worker. Your handler consumes a message
and returns a Promise or value.

#### `register(function or object)`

Accepts either:

* `function`
  * Takes a message, returns a Promise or a value.
* `object`
  * Contains a mapping of message IDs to functions. Each of those functions takes a message and returns a Promise or a value.
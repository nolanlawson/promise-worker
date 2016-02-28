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
var PromiseWorker = require('promise-worker/client');
var worker = new Worker('worker.js');
var promiseWorker = new PromiseWorker(worker);

promiseWorker.postMessage({
  hello: 'world'
}).then(function (response) {
  // handle response
}).catch(function (error) {
  // handle error
});
```

Inside your `worker.js` bundle:

```js
var PromiseWorker = require('promise-worker/worker');

PromiseWorker.register(function (message) {
  // return a Promise or a value
});
```

The message can be any object, array, string, number, etc. Note that it will be `JSON.stringify`d, so you
can't send functions, `Date`s, custom classes, etc.

Also note that you `require()` two separate APIs, so that the library is split
between the `worker.js` and main file. This keep the total bundle size smaller.

(If you really must, you can `require('promise-worker')`, and both APIs are
available at the top level.)

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
PromiseWorker.register({
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

### Avoiding `JSON.stringify`

If you need to send `Blob`s, `ArrayBuffer`s, or other objects that you don't
want to be `stringify`d, use `postRawMessage()`:

```js
// main.js
promiseWorker.postRawMessage('myBlobMessage', 
  new Blob(['blobalicious'], {type: 'text/plain'})
).then(/* ... */);

```

Then inside your `worker.js` bundle:

```js
// worker.js
PromiseWorker.register({
  myBlobMessage: function (blob) {
    return "oh hi blob";
  }
});
```

API
---

### Client

#### `PromiseWorker.postMessage([messageId, ] message)`

* `messageId` - String - optional
  * The message ID, or none if you only have one kind of message.
* `message` - object - required
  * The message to send. Will be `stringify`ed.
* returns a `Promise`

#### `PromiseWorker.postRawMessage([messageId, ] message)`

* `messageId` - String - optional
  * The message ID, or none if you only have one kind of message.
* `message` - object - required
  * The message to send. Will not be `stringify`ed.
* returns a `Promise`

### Worker

#### `PromiseWorker.register(function or object)`

Accepts either:

* `function`
  * Takes a message, returns a `Promise` or a value.
* `object`
  * Contains a mapping of message IDs to functions. Each of those functions takes a message and returns a `Promise` or a value.
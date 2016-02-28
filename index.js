'use strict';

/* istanbul ignore next */
var MyPromise = typeof Promise !== 'undefined' ? Promise : require('lie');

var messageIds = 0;

function PromiseWorker(worker) {
  var self = this;
  self._worker = worker;
  self._callbacks = {};

  worker.addEventListener('message', function onIncomingMessage(e) {
    var message = JSON.parse(e.data);
    var messageId = message[0];
    var error = message[1];
    var result = message[2];

    var callback = self._callbacks[messageId];

    if (!callback) {
      // Ignore - user might have created multiple PromiseWorkers.
      // This message is not for us.
      return;
    }

    delete self._callbacks[messageId];
    callback(error, result);
  });
}

PromiseWorker.prototype.postMessage = function (userMessage) {
  var self = this;
  var messageId = messageIds++;

  var messageToSend = [messageId, userMessage];

  return new MyPromise(function (resolve, reject) {
    self._callbacks[messageId] = function (error, result) {
      if (error) {
        return reject(new Error(error.message));
      }
      resolve(result);
    };
    self._worker.postMessage(JSON.stringify(messageToSend));
  });
};

module.exports = PromiseWorker;
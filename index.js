'use strict';

var MyPromise = typeof Promise !== 'undefined' ? Promise : require('lie');

function PromiseWorker(worker) {
  var self = this;
  self._worker = worker;
  self._callbacks = {};
  self._messageId = 0;

  worker.addEventListener('message', function (e) {
    self._onIncomingMessage(e);
  });
}

PromiseWorker.prototype.postMessage = function (messageType, message) {
  var self = this;
  var messageId = self._messageId++;

  var messageToSend;
  if (typeof message === 'undefined') {
    messageToSend = [messageId, messageType, message];
  } else {
    messageToSend = [messageId, message, messageType];
  }

  return new MyPromise(function (resolve, reject) {
    self._worker.postMessage(JSON.stringify(messageToSend));
    self._callbacks[messageId] = function (error, result) {
      if (error) {
        return reject(error);
      }
      resolve(result);
    };
  });
};

PromiseWorker.prototype._onIncomingMessage = function (e) {
  var message = JSON.parse(e.data);
  var messageId = message[0];
  var error = message[1];
  var result = message[2];

  var callback = self._callbacks[messageId];
  delete self._callbacks[messageId];
  callback(error, result);
};

module.exports = PromiseWorker;
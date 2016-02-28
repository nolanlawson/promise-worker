'use strict';

var isPromise = require('is-promise');

function register(objectOrFunc) {

  var callbacks = {};
  var defaultCallback;

  function postOutgoingMessage(messageId, error, result) {
    if (error) {
      self.postMessage(JSON.stringify([messageId, error.message]));
    } else {
      self.postMessage(JSON.stringify([messageId, null, result]));
    }
  }

  function tryCatchFunc(callback, message) {
    try {
      return {res: callback(message)};
    } catch (e) {
      return {err: e};
    }
  }

  function handleIncomingMessage(callback, messageId, message) {

    var result = tryCatchFunc(callback, message);

    if (result.err) {
      postOutgoingMessage(messageId, result.err);
    } else if (!isPromise(result.res)) {
      postOutgoingMessage(messageId, null, result.res);
    } else {
      result.res.then(function (finalResult) {
        postOutgoingMessage(messageId, null, finalResult);
      }, function (finalError) {
        postOutgoingMessage(messageId, finalError);
      });
    }
  }

  function onIncomingMessage(e) {
    var payload = e.data;
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }
    var messageId = payload[1];
    var message = payload[2];
    var messageType = payload[3];

    if (typeof messageType === 'undefined') {
      if (!defaultCallback) {
        postOutgoingMessage(messageId, new Error(
          'No default message handler registered'));
      } else {
        handleIncomingMessage(defaultCallback, messageId, message);
      }
    } else {
      var callback = callbacks[messageType];
      if (!callback) {
        postOutgoingMessage(messageId, new Error(
          'No message handler registered for type: "' + messageType + '"'));
      } else {
        handleIncomingMessage(callback, messageId, message);
      }
    }
  }

  if (typeof objectOrFunc === 'object') {
    Object.keys(objectOrFunc).forEach(function (messageType) {
      callbacks[messageType] = objectOrFunc[messageType];
    });
  } else {
    defaultCallback = objectOrFunc;
  }

  self.addEventListener('message', onIncomingMessage);
}

module.exports = register;
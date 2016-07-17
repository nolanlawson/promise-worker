'use strict';

var isPromise = require('is-promise');

function parseJsonSafely(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return false;
  }
}

function register(callback) {

  function postOutgoingMessage(messageId, error, result) {
    if (error) {
      /* istanbul ignore else */
      if (typeof console !== 'undefined' && 'error' in console) {
        // This is to make errors easier to debug. I think it's important
        // enough to just leave here without giving the user an option
        // to silence it.
        console.error('Worker caught an error:', error);
      }
      self.postMessage(JSON.stringify([messageId, {
        message: error.message
      }]));
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
    var payload = parseJsonSafely(e.data);
    if (!payload) {
      // message isn't stringified json; ignore
      return;
    }
    var messageId = payload[0];
    var message = payload[1];

    if (typeof callback !== 'function') {
      postOutgoingMessage(messageId, new Error(
        'Please pass a function into register().'));
    } else {
      handleIncomingMessage(callback, messageId, message);
    }
  }

  self.addEventListener('message', onIncomingMessage);
}

module.exports = register;
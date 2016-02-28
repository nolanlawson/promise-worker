'use strict';

var isPromise = require('is-promise');

exports.register = function register(objectOrFunc) {

  var callbacks = {};
  var defaultCallback;

  function postMessage(messageId, message) {

  }

  function onMessage(e) {
    var payload = e.data;
    if (typeof payload === 'string') {
      payload = JSON.parse(payload);
    }
    var messageId = payload.id;
    var message = payload.msg;

    if (typeof messageId === 'string') {
      if (!defaultCallback) {

        return console.error('Unknown message id: ' + messageId);
      }
      handleMessage(defaultCallback, message);
    } else {
      handleMessage(callbacks['$' + messageId], message);
    }
  }

  function handleMessage(callback, message) {
    if (!callback) {
      console.error('unknown message')
    }

    try {

    } catch (err) {

    }
  }

  self.addEventListener('message', onMessage);

  function registerFunction(fun) {

  }

  if (typeof objectOrFunc === 'object') {
    Object.keys(objectOrFunc).forEach(function (key) {
    });
  }
};
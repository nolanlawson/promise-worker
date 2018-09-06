'use strict'

// XHR shim for node

var fs = require('fs')

function XHR () {
}

XHR.prototype.open = function (type, script) {
  this.script = script
}

XHR.prototype.send = function () {
  var that = this
  process.nextTick(function () {
    that.readyState = 2
    that.onreadystatechange()
    process.nextTick(function () {
      that.readyState = 4
      if (fs.existsSync(that.script)) {
        that.responseText = fs.readFileSync(that.script, 'utf-8')
        that.status = 200
      } else {
        that.status = 404
      }
      that.onreadystatechange()
    })
  })
}

module.exports = XHR

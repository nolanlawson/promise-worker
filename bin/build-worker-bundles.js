'use strict'

var Promise = require('lie')
var denodeify = require('denodeify')
var rimraf = denodeify(require('rimraf'))
var mkdirp = denodeify(require('mkdirp'))
var glob = require('glob-promise')
var streamToPromise = require('stream-to-promise')
var browserify = require('browserify')
var fs = require('fs')
var writeFile = denodeify(fs.writeFile)
var path = require('path')

Promise.resolve().then(function () {
  return rimraf('test/bundle')
}).then(function () {
  return mkdirp('test/bundle')
}).then(function () {
  return glob('test/worker*js')
}).then(function (files) {
  return Promise.all(files.map(function (file) {
    var b = browserify(file, { debug: true })
    if (process.env.COVERAGE === '1') {
      b = b.transform('istanbulify')
    }
    b = b.bundle()
    return streamToPromise(b).then(function (buff) {
      var outputFile = 'bundle-' + path.basename(file)
      return writeFile(outputFile, buff, 'utf-8')
    })
  }))
}).catch(function (err) {
  console.log(err.stack)
})

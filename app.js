var util = require('util');
var config = require('config');
var _ = require('lodash');
var Tagger = require('./lib/bukkitagger');

// Each of your sources (or localhost)
// if fully qualified file, fetch it
// if just domain, fetch the bukkitags.json
// Promise(parse and assert that the file is clean)

// fetch file

var db = {}
var t = new Tagger(config.get('sources'));

t.process()
.then(function() {
  console.log(t.db);
});

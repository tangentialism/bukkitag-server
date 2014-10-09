var config = require('config');
var Taggregator = require('taggregator');

var express = require('express');
var app = express();
var server;

var t = new Taggregator(config.get('sources'), {
  tagWithFilename: true
});

app.get('/bukkitags.json', function(req, res){
  res.json(t.db);
});

app.get('/tag/:tag.json', function(req, res){
  var urls = t.db.tags[req.params.tag] || [];
  res.json(
    { 
      "tags": [req.params.tag],
      "urls": urls
    }
  );

});

t.process()
.then(function() {
  server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
  });
});

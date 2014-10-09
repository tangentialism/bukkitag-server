var Promise = require('bluebird');
var util = require('util');
var http = Promise.promisifyAll(require('needle'));
var _ = require('lodash');

var Tagger = function(urls) {
  this.db = {
    sources: [],
    tags: {}
  };

  var self = this;

  var parse = function(data) {
    return Promise.try(function() {
      // is file by URL or by tag?
      if (data.tags) {
        // process tags
        // processTag foreach tags
        Object.keys(data.tags).forEach(function(tag) {
          processTag(tag, data.tags[tag]);
        });
      }
      else if (data.urls) {
        // process urls
        // processURL foreach urls
        Object.keys(data.urls).forEach(function(url) {
          processUrl(url, data.urls[url]);
        });
      }
      else {
        // throw error
        throw new Error('You need either a "keys" or "urls" object')
      }

      // Uniques
      Object.keys(self.db.tags).forEach(function(tag) {
        self.db.tags[tag] = _.uniq(self.db.tags[tag]);
      });
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  var processTag = function(tag, vals) {
    // File URLs by parsing through tags' associated urls
    vals.forEach(function(url) {
      insertRecord(tag, url);
    });
  };

  var processUrl = function(url, vals) {
    // File URLs by parsing through urls' associated tags
    vals.forEach(function(tag) {
      insertRecord(tag, url);
    });
  };

  var insertRecord = function(tag, url) {
    if (typeof tag === Number) {
      tag = Number.toString(tag);
    }

    if (self.db.tags[tag] && util.isArray(self.db.tags[tag])) {
      self.db.tags[tag].push(url);
    }
    else {
      self.db.tags[tag] = [url];
    }
    return self.db.tags[tag].length;
  };

  var fetch = function(url) {
    return http.getAsync(url)
    .then(function(res) {
      self.db.sources.push(url);
      var data = res[1];
      parse(data);
    }).catch(function(e) {
      console.log('Fetch error: ' + e.message);
    });
  };

  var process = Promise.method(function(urls) {
    return Promise.try(function() {
      if (urls) {
        if (!util.isArray(urls)) {
          urls = [urls];
        }
      }
      else {
        throw new Error('You need to check at least one URL, man.');
      }
      return urls;
    })
    .each(function(url) {
      return fetch(url);
    })
    .then(function() {
      return self.db;
    }); 
  });

  this.process = process;
};

module.exports = Tagger;
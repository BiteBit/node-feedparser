var _ = require('lodash');
var FeedParser = require('feedparser');
var StringStream = require('string-stream');

var defaultSiteTags = ['title', 'description', 'date', 'link', 'author'];

var defaultItemTags = ['title', 'description', 'summary', 'date', 'link', 'author'];


/*
xmlContent String
  rss,feed,rdf xml content

options Object or Function
  if Object
    options.siteTags Array
      select site tags
    options itemTags Array
      select article tags
  if Function
    callback

callback Function
  callback Error, {site,items}
 */

module.exports = function(xmlContent, options, callback) {
  var feedparser, items, site, stream;
  feedparser = new FeedParser();
  site = {};
  items = [];
  if (_.isFunction(options)) {
    callback = options;
    options = {
      siteTags: defaultSiteTags,
      itemTags: defaultItemTags
    };
  }
  stream = new StringStream(xmlContent);
  stream.pipe(feedparser);
  feedparser.on('error', function(error) {
    return callback(error);
  });
  feedparser.on('readable', function() {
    var item, _results;
    if (_.isEmpty(site) && this.meta) {
      site = _.pick(this.meta, options.siteTags);
    }
    _results = [];
    while (item = this.read()) {
      _results.push(items.push(_.pick(item, options.itemTags)));
    }
    return _results;
  });
  return feedparser.on('end', function() {
    return callback(null, {
      site: site || {},
      items: items
    });
  });
};

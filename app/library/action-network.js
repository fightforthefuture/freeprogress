var https       = require('https');
var querystring = require('querystring');
var request     = require('request');

var apiKey;
var lessEmailsTag;

var init = function(config) {
    apiKey = config.actionnetwork_api_key;
    lessEmailsTag = config.actionnetwork_less_emails_tag;
}

var verifySubscriber = function(uid, callback) {
  console.log('Verifying Action Network subscription for:', uid);

  var url = 'https://actionnetwork.org/api/v2/people/'+uid;

  _apiCall(url, function(err, data) {

    if (err)
      return callback(err);

    // If the user isn't found, we'll get a response with error: 'whatever'
    if (data.error)
      return callback(null, false);

    // If the user isn't subscribed, we should go home
    if (!data.email_addresses
        ||
        data.email_addresses.constructor !== Array
        ||
        data.email_addresses.length == 0
        ||
        data.email_addresses[0].status != 'subscribed')
      return callback(null, false);

    console.log('User '+uid+' is not unsubscribed. Now checking taggings...');

    url = url + '/taggings';

    _apiCall(url, function(err, data) {

      if (err || data.error)
        return callback(err || data.error);

      if (!data['_links']
          || !data['_links']['osdi:taggings']
          || data['_links']['osdi:taggings'].constructor !== Array)
        return callback({
            ref: 'EXTERNAL_NETWORK_SUBSCRIBER_LOOKUP_FAIL',
            info: 'Malformed osdi:taggings array',
            url: url,
            dump: data});

      var tags = data['_links']['osdi:taggings'];

      // JL TODO ~ JL NOTE ~ If the user has 25 or more tags, then we're dealing
      // with pagination, and that's a can of worms I don't want to open right
      // now. In this case, we're just going to say they're not subscribed lol.
      if (tags.length == 25) {
        console.log('JL NOTE ~ JL DEBUG ~ hit 25 taggings maximum! ignoring!!');
        return callback(null, false)
      }

      for (var i = 0; i < tags.length; i++) {
        if (!tags[i].href || tags[i].href.indexOf(lessEmailsTag) !== -1) {
          console.log('User '+uid+' has the LESS EMAILS TAG. Abort!!!');
          return callback(null, false);
        }
      }
      console.log('User '+uid+' is subscribed and taggings look OK');
      callback(null, true);
    });
  });
}

var _apiCall = function(url, callback) {
  var
    options = {
      hostname: 'actionnetwork.org',
      path: url,
      method: 'GET',
      headers: {
        'OSDI-API-Token': apiKey,
        'Content-Type': 'application/json'
      }
    },
    query = {},
    responseData = '',
    compileResponse = function (response) {
      response.setEncoding('utf8');
      response.on('data', function (chunk) { responseData += chunk; });
      response.on('end', function () {
        try {
          var data = JSON.parse(responseData);
        } catch(err) {
          return callback({
            ref: 'EXTERNAL_NETWORK_SUBSCRIBER_LOOKUP_FAIL',
            data: err,
            url: options.path,
            dump: responseData});
        }
        callback(null, data);
      });
    },
    req = https.request(options, compileResponse);

  req.on('error', function (error) {
    console.log('Action Network error:', error);
    callback({ref: 'EXTERNAL_NETWORK_SUBSCRIBER_LOOKUP_FAIL', data: error});
  });
  req.write(querystring.stringify(query))
  req.end();
}

module.exports = {
  init: init,
  verifySubscriber: verifySubscriber
};

var sparkpost, client;

module.exports = function(config) {

  sparkpost = require("sparkpost");
  client = new sparkpost(config.sparkpost_api_key);

  return function(message) {

    var from = message.from;

    if (message.fromName)
      from = { name: message.fromName, email: message.from };

    client.transmissions.send({
      transmissionBody: {
        content: {
          from: from,
          subject: message.subject,
          html: message.body
        },
        recipients: [
          {address: message.to}
        ]
      }
    }, function(err, res) {
      if (err)
        return console.error('Sparkpost error:', err);
      console.log('SENT!', res);
    });
  }
};

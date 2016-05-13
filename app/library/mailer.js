var sendgrid;

module.exports = function(config) {

  sendgrid = require("sendgrid")(config.sendgrid_api_key)

  return function(message) {

    var email = new sendgrid.Email();

    email.addTo(message.to);
    email.setFrom(message.from);
    email.setSubject(message.subject);
    email.setHtml(message.body);

    if (message.toName)
      email.setFromName(message.toName);

    if (message.fromName)
      email.setFromName(message.fromName);

    sendgrid.send(email, function(err, json) {
      if (err)
        return console.error('Sendgrid error:', err);
      console.log('SENT!', json);
    });
  }
};

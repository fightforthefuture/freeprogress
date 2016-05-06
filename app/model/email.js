var Sequelize = require('sequelize'),
    URL       = require('url-parse');

var model = null;

var _init = function(baseModel) {

  model = baseModel;

  var sendMail = require("../library/mailer")(model._util.config);

  var Email = baseModel._sequelize.define('email',
    {
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      url: {
        type: Sequelize.STRING,
      },
      external_network: {
        type: Sequelize.STRING,
      },
      external_network_id: {
        type: Sequelize.STRING
      },
      create_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      mod_date: {
        type: Sequelize.DATE
      },
    },
    {
      timestamps: false,
      underscored: true,
      freezeTableName: true,
      tableName: baseModel._dbPrefix + 'email',
      classMethods: {

        scheduleEmailForUrl: function(email, url, external, external_id, cb) {
          if (!email)
            return cb({ref: 'EMAILS_MISSING_EMAIL', data: url}, null);

          if (!url)
            return cb({ref: 'EMAILS_MISSING_URL', data: url}, null);

          Email.destroy({ where: { email: email } }).then(function(deleted) {
            Email.create({
              email:                email,
              url:                  url,
              external_network:     external,
              external_network_id:  external_id
            }).then(function(email) {
              cb(null, email);
            });
          });
        },
      }
    }
  );
  module.exports.Email = Email;
}

var waitToProcessNext = function(delay) {
  return setTimeout(function() {
    processNextEmail();
  }, delay);
};

var processNextEmail = function() {
  model.Email.findOne({
    where: {
      // JL DEBUG ~ comment the next line out to send immediately lololo
      // create_date: {$lt: new Date(new Date() - 24 * 60 * 60 * 1000 * 3)}
    }
  }).then(function(email) {
    if (!email) {
      console.log('No autoresponder emails to send now. Chilling...');
      return waitToProcessNext(300000);
    }
    console.log('Sending email for: ', email.email, '/', email.url);

    // First we have to make sure that this is a valid Free Progress URL
    model.Site.getSiteFromURL(email.url, function(err, site) {
      if (err) {
        destroyEmailAndProcessNext(email);
        return sendErrorAlertEmail({
          info:                 'Error occurred while scraping site',
          email:                email.email,
          url:                  email.url,
          external_network:     email.external_network,
          external_network_id:  email.external_network_id,
          err:                  err,
          });
      }

      if (email.external_network == 'action-network') {

        console.log('- Requires Action Network integration');

        if (!model._util.config.actionnetwork_integration) {
          console.warn('WARNING! Action Network disabled. Skipping...');
          return destroyEmailAndProcessNext(email);
        }

        var an = require("../library/action-network");
        an.init(model._util.config);

        return an.verifySubscriber(
          email.external_network_id,
          function(err, isSubscriber) {
            if (err) {
              console.log('ACTION NETWORK ERROR: ', err);
              // JL NOTE ~ should i destroy if action network error?
              // JL NOTE ~ or should i just try again in 30 seconds?
              // JL NOTE ~ guess i wait to see if this destroys my inbox
              // destroyEmailAndProcessNext(email);
              waitToProcessNext(30000);
              return sendErrorAlertEmail({
                info: 'Action Network error',
                email:                email.email,
                url:                  email.url,
                external_network:     email.external_network,
                external_network_id:  email.external_network_id,
                err:                  err,
                });
            }
            if (!isSubscriber) {
              console.log('Email '+email.email+' not subscribed. ABORT')
              return destroyEmailAndProcessNext(email);
            }
            console.log('SUBSCRIBED YAY');
            scrapePageAndSendEmailAndProcessNext(email, site);
          }
        );
      }
      return scrapePageAndSendEmailAndProcessNext(email, site);

    });
  });
};

var destroyEmailAndProcessNext = function(email) {
  console.log('Destroying email:', email.email);
  email.destroy().then(function() {
    processNextEmail();
  });
};

var scrapePageAndSendEmailAndProcessNext = function(email, site) {
  console.log('scrapePageAndSendEmail:');
  var parsedUrl = new URL(email.url);
  model.Page.scrapeMetaData(parsedUrl, function(err, metaData) {
    if (err) {
      // destroyEmailAndProcessNext(email); // JL DEBUG ~
      waitToProcessNext(30000);
      return sendErrorAlertEmail({
        info: 'Error scraping Email Autoresponder target URL',
        email:                email.email,
        url:                  email.url,
        external_network:     email.external_network,
        external_network_id:  email.external_network_id,
        err:                  err,
        });
    }
    var page = site.pages[0];
    var options = { emailRedirect: true };
    model.VariationTW.getRandomVariation(page, options, function(tw) {
      model.VariationFB.getRandomVariation(page, options, function(fb) {
        console.log('metaData:', metaData);
        console.log('page.id:', page.id);
        console.log('tw:', tw);
        console.log('fb:', fb);

        var body = generateEmailBody(metaData, tw, fb);
        console.log('body:', body);
      });
    });
  });
};

var generateEmailBody = function(metaData, variationTW, variationFB) {
  return 'lol';
};

var sendErrorAlertEmail = function(data) {
  if (!model._util.config.alerts_sending == 'on') {
    console.log('Email error occurred, but alerts are off:', data.err);
    return false;
  }
  console.log('Sending error report email:', data);

  var error = JSON.stringify(data.err);
  var admin = model._util.config.alerts_admin_email;
  var body  = "<div style=\"font-family: Courier New, mono\">";
      body += "<h2>Free Progress Alert</h2><p>"+data.info+"</p>";
      body += "<p><strong>EMAIL:</strong> "+data.email+"<br/>";
      body += "<strong>URL:</strong> "+data.url+"<br/>"
      body += "<strong>NETWORK:</strong> "+data.external_network+"<br/>"
      body += "<strong>USER_ID:</strong> "+data.external_network_id+"<br/>"
      body += "<strong>ERR:</strong>&nbsp;&nbsp;&nbsp;"+error+"</p>";
      body += "</div>";

  sendMail({
    to:       admin,
    from:     admin,
    fromName: "Free Progress Alerts",
    subject:  "Free Progress: "+data.info,
    body:     body
  });
};

setTimeout(function() {
  processNextEmail();
}, 300);

module.exports = { _init: _init };

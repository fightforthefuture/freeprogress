var Sequelize = require('sequelize'),
    URL       = require('url-parse'),
    request   = require('request'),
    hash      = require('sha.js');

var model = null;

var _init = function(baseModel) {

  model = baseModel;

  var Site = baseModel._sequelize.define('site',
    {
      host: {
        type: Sequelize.STRING,
        unique: true
      },
      authorized: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
      tableName: baseModel._dbPrefix + 'site',
      classMethods: {

        /*
         *  Gets a site from a URL. If a site doesn't exist in the database,
         *  then the URL is scraped and data for the site is populated and
         *  return via callback. If the site exists in the database, but the
         *  page (path) does not exist, we'll scrape and populate for that page.
         */
        getSiteFromURL: function(url, callback) {
          var parsedUrl = new URL(url);

          if (!parsedUrl.host)
            return callback({ref: 'TESTS_BAD_URL', data: url}, null);

          if (!parsedUrl.pathname)
            parsedUrl.pathname = '/';

          var query = {
            where: {host: parsedUrl.host},
            include: [
              {
                model: model.Page,
                where: {path: parsedUrl.pathname},
                required: false,
                include: [
                  {model: model.VariationFB},
                  {model: model.VariationTW}
                ]
              }
            ]
          }

          Site.findOne(query).then(function(site) {

            if (!site) {
              return this.domainSecurityCheck(parsedUrl, function(err) {
                if (err) return callback(err, null)

                model.Page.scrapeMetaData(parsedUrl, function(err, mData) {
                  if (err) return callback(err, null)

                  this.populateFromPageMetaData(parsedUrl, mData, callback);
                }.bind(this));
              }.bind(this));
            }

            if (site.pages.length == 0) {
              return model.Page.scrapeMetaData(parsedUrl, function(err, mData) {
                if (err) return callback(err, null)

                model.Page.populateFromMetaData(site,parsedUrl,mData,callback);
              }.bind(this));
            }

            callback(null, site)
          });
        },

        /**
         *  Populates a site from metadata, populates its pages and initial
         *  variations underneath, and passes the callback through
         */
        populateFromPageMetaData: function(parsedUrl, metaData, callback) {
          return this.createFromData({host: parsedUrl.host}, function(site){
            model.Page.populateFromMetaData(site,parsedUrl,metaData,callback);
          });
        },

        /**
         *  Creates a site from a data object
         */
        createFromData: function(site, callback) {
          Site.create(site).then(function(site) {
            callback(site);
          });
        },

        /**
         *  Checks that the domain is authorized for Free Progress
         */
        domainSecurityCheck: function(url, callback) {

          if (model._util.config.domain_security != 'on')
            return callback();

          if (model._util.config.domain_security_whitelist) {
            okDomain = model._util.config.domain_security_whitelist.split(',');

            for (var i=0; i<okDomain.length; i++) {
              if (url.host.trim().toLowerCase == okDomain[i].trim.toLowerCase())
                return callback();
            }
          }

          var securityToken = model._util.config.domain_security_token.trim(),
              sanitizedHost = url.host.trim().toLowerCase(),
              tokenConcat   = securityToken + sanitizedHost,
              correctHash   = hash('sha256').update(tokenConcat).digest('hex'),
              tokenHashUrl  = url.protocol+'//'+url.host+'/freeprogress.txt';

          request(tokenHashUrl, function (err, response, body) {
            if (err || response.statusCode != 200)
              return callback({ref: 'SITE_DOMAIN_SECURITY_SCRAPE_FAIL'});

            if (body.trim() != correctHash)
              return callback({ref: 'SITE_UNAUTHORIZED_DOMAIN'});

            callback();
          });
        }
      }
    }
  );

  module.exports.Site = Site;
}

module.exports = { _init: _init };

var Sequelize   = require('sequelize');
var URL = require('url-parse');

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

          if (!parsedUrl.host || !parsedUrl.pathname)
            return callback({ref: 'TESTS_BAD_URL', data: url}, null);

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
              return model.Page.scrapePageMetaData(parsedUrl, function(err, metaData){
                if (err) return callback(err, null)

                this.populateFromPageMetaData(parsedUrl, metaData, callback);
              }.bind(this));
            }

            if (site.pages.length == 0) {
              return model.Page.scrapePageMetaData(parsedUrl, function(err, metaData){
                if (err) return callback(err, null)

                model.Page.populateFromMetaData(site, parsedUrl, metaData, callback);
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
            model.Page.populateFromMetaData(site, parsedUrl, metaData, callback);
          });
        },

        /**
         *  Creates a site from a data object
         */
        createFromData: function(site, callback) {
          Site.create(site).then(function(site) {
            callback(site);
          });
        }
      }
    }
  );

  module.exports.Site = Site;
}

module.exports = { _init: _init };

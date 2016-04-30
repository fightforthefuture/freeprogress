var Sequelize   = require('sequelize');
var jsdom = require("node-jsdom");

var model = null;

var _init = function(baseModel) {

  model = baseModel;

  var Page = baseModel._sequelize.define('page',
    {
      path: {
        type: Sequelize.STRING
      },
      site_id: {
        type: Sequelize.BIGINT,
          references: {
          model: model.Site,
          key: "id"
        }
      },
      test_running: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      test_started: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
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
      tableName: baseModel._dbPrefix + 'page',
      classMethods: {

        /*
         *  Scrapes social metadata from a URL
         */
        scrapeMetaData: function(parsedUrl, callback) {

          var initialTW = {
            url: parsedUrl.href,
            default: true
          };
          var initialFB = {
            url: parsedUrl.href,
            default: true
          };

          jsdom.env(
            parsedUrl.href,
            ["http://code.jquery.com/jquery.js"],
            function (err, window) {
              if (err)
                return callback({ref: 'TESTS_SCRAPE_ERROR', data: err}, null);

              var meta = window.$("meta");
              for (var tag in meta) {
                if (meta.hasOwnProperty(tag)) {

                  var jqTag     = window.$(meta[tag]);
                  var name      = jqTag.attr('name');
                  var property  = jqTag.attr('property');
                  var content   = jqTag.attr('content');

                  switch (name) {
                    case 'twitter:site':
                      initialTW.site = content;
                      break;
                    case 'twitter:title':
                      initialTW.title = content;
                      break;
                    case 'twitter:description':
                      initialTW.description = content;
                      break;
                    case 'twitter:image':
                      initialTW.image_url = content;
                      break;
                    case 'twittertext':
                    case 'twitter:text':
                      initialTW.tweet_text = content;
                      break;
                  }

                  switch (property) {
                    case 'og:site_name':
                      initialFB.site_name = content;
                      break;
                    case 'og:title':
                      initialFB.title = content;
                      break;
                    case 'og:description':
                      initialFB.description = content;
                      break;
                    case 'og:image':
                      initialFB.image_url = content;
                      break;
                  }
                }
              };

              return callback(null, {
                initialTW: initialTW,
                initialFB: initialFB
              });
            }
          );
        },

        /**
         *  Populates a page from metadata along with the initial variations
         *  beneath it. Then formats the data nicely and returns via callback.
         */
        populateFromMetaData: function(site, parsedUrl, metaData, callback) {
          var page = {
            site_id: site.id,
            path: parsedUrl.pathname
          };
          var fbData = metaData.initialFB;
          var twData = metaData.initialTW;
          this.createFromData(page, function(page) {
            fbData.page_id = page.id;
            twData.page_id = page.id;

            model.VariationFB.createFromData(fbData, function(variationFb) {

              page.variation_fbs = [variationFb];
              page.dataValues.variation_fbs = page.variation_fbs;

              model.VariationTW.createFromData(twData, function(variationTw) {

                page.variation_tws = [variationTw];
                page.dataValues.variation_tws = page.variation_tws;

                if (!site.pages)
                  site.pages = [page];
                else
                  site.pages.push(page);

                site.dataValues.pages = site.pages;

                callback(null, site);
              });
            });
          });
        },

        /**
         *  Creates a page from a data object
         */
        createFromData: function(page, callback) {
          Page.create(page).then(function(page) {
            callback(page);
          });
        },

        /**
         *  Runs all A/B tests on the Page's social variations
         */
        runVariationTests: function() {
          this.findAll().then(function(pages) {
            for (var i = 0; i < pages.length; i++) {
              model.VariationTW.findAndDeactivateLosers(pages[i]);
              model.VariationFB.findAndDeactivateLosers(pages[i]);
            }
          });
        }
      }
    }
  );

  Page.belongsTo(model.Site, {
    through: {
      model: Page,
      unique: false,
    },
    foreignKey: 'site_id'
  });
  model.Site.hasMany(Page);

  module.exports.Page = Page;

  setInterval(function() {
    console.log('Running variation tests...');
    model.Page.runVariationTests();
  }, 300000);
}

module.exports = { _init: _init };

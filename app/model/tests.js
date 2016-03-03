var Sequelize   = require('sequelize');
var URL = require('url-parse');
var jsdom = require("node-jsdom");

var _init = function(tblPrefix, sequelize) {
  var Site = sequelize.define('site',
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
      tableName: tblPrefix + 'site',
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
                model: Page,
                where: {path: parsedUrl.pathname},
                required: false,
                include: [
                  {model: VariationFB},
                  {model: VariationTW}
                ]
              }
            ]
          }

          Site.findOne(query).then(function(site) {

            if (!site) {
              return Page.scrapePageMetaData(parsedUrl, function(err, metaData){
                if (err) return callback(err, null)

                this.populateFromPageMetaData(parsedUrl, metaData, callback);
              }.bind(this));
            }

            if (site.pages.length == 0) {
              return Page.scrapePageMetaData(parsedUrl, function(err, metaData){
                if (err) return callback(err, null)

                Page.populateFromMetaData(site, parsedUrl, metaData, callback);
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
            Page.populateFromMetaData(site, parsedUrl, metaData, callback);
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

  var Page = sequelize.define('page',
    {
      path: {
        type: Sequelize.STRING,
        unique: true
      },
      site_id: {
        type: Sequelize.BIGINT,
          references: {
          model: Site,
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
      tableName: tblPrefix + 'page',
      classMethods: {

        /*
         *  Scrapes social metadata from a URL
         */
        scrapePageMetaData: function(parsedUrl, callback) {
          console.log('scraping site: ', parsedUrl);

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
                    case 'twitter:image:src':
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

              console.log('initialTW: ', initialTW);
              console.log('initialFB: ', initialFB);
              
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

            VariationFB.createFromData(fbData, function(variationFb) {

              page.variation_fbs = [variationFb];
              page.dataValues.variation_fbs = page.variation_fbs;

              VariationTW.createFromData(twData, function(variationTw) {

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
        }
      }
    }
  );

  var VariationFB = sequelize.define('variation_fb',
    {
      page_id: {
        type: Sequelize.BIGINT,
          references: {
          model: Page,
          key: "id"
        }
      },
      site_name: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
      tableName: tblPrefix + 'variation_fb',
      classMethods: {

        /**
         *  Creates a variation from a data object
         */
        createFromData: function(variation, callback) {
          VariationFB.create(variation).then(function(variation) {
            callback(variation);
          });
        }
      }
    }
  );

  var VariationTW = sequelize.define('variation_tw',
    {
      page_id: {
        type: Sequelize.BIGINT,
          references: {
          model: Page,
          key: "id"
        }
      },
      tweet_text: {
        type: Sequelize.STRING
      },
      site: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING
      },
      image_url: {
        type: Sequelize.STRING
      },
      shares: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      confidence: {
        type: Sequelize.FLOAT,
        defaultValue: 0.0,
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      tableName: tblPrefix + 'variation_tw',
      classMethods: {

        /**
         *  Creates a variation from a data object
         */
        createFromData: function(variation, callback) {
          VariationTW.create(variation).then(function(variation) {
            callback(variation);
          });
        }
      }
    }
  );

  Page.belongsTo(Site, {
    through: {
      model: Page,
      unique: false,
    },
    foreignKey: 'site_id'
  });
  Site.hasMany(Page);

  VariationTW.belongsTo(Page, {
    through: {
      model: VariationTW,
      unique: false,
    },
    foreignKey: 'page_id'
  });
  Page.hasMany(VariationTW);

  VariationFB.belongsTo(Page, {
    through: {
      model: VariationFB,
      unique: false,
    },
    foreignKey: 'page_id'
  });
  Page.hasMany(VariationFB);

  module.exports.Site = Site;
  module.exports.Page = Page;
  module.exports.VariationFB = VariationFB;
  module.exports.VariationTW = VariationTW;
}

module.exports = { _init: _init };

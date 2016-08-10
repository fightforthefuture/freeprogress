var Sequelize   = require('sequelize');
var jsdom = require("node-jsdom");
var sha1 = require('sha1');
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
      shortcode_fb: {
        type: Sequelize.STRING,
        index: true
      },
      shortcode_tw: {
        type: Sequelize.STRING,
        index: true
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
          var autoresponder = {
            subject: null,
            body: null
          }

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
                    case 'autoresponder_subject':
                      autoresponder.subject = content;
                      break;
                    case 'autoresponder_text':
                    case 'autoresponder_body':
                      autoresponder.body = content;
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
                initialTW:     initialTW,
                initialFB:     initialFB,
                autoresponder: autoresponder
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

          this.generateShortcodes(function(shortcodes) {

            page.shortcode_tw = shortcodes.shortcode_tw;
            page.shortcode_fb = shortcodes.shortcode_fb;

            Page.create(page).then(function(page) {
              callback(page);
            });
          });
        },

        /**
         *  Find a page by its shortcode
         */
        getByShortcode: function(shortcode, callback) {
          this.findOne(this.shortcodeSearchQuery(shortcode)).then(function(res){
            if (!res) return callback(null);
            res = res.toJSON();
            callback(res);
          });
        },

        /**
         *  Generates "unique" short codes for the page master sharing links
         */
        generateShortcodes: function(callback) {
          var fb = sha1(new Date().toISOString()+Math.random()).substr(0, 6),
              tw = sha1(Math.random()+new Date().toISOString()).substr(1, 7);

          this.findAll(this._shortcodeSearchQuery(fb)).then(function(models1) {
            if (models1.length) {
              console.log('SHORTCODE COLLISION OMG OMG:', fb);
              return this.generateShortcode(callback);
            }
            this.findAll(this._shortcodeSearchQuery(tw)).then(function(models2){
              if (models2.length) {
                console.log('SHORTCODE COLLISION OMG OMG:', tw);
                return this.generateShortcode(callback);
              }
              callback({
                shortcode_fb: fb,
                shortcode_tw: tw,
              });
            }.bind(this));
          }.bind(this));
        },

        /**
         *  Saves basic fields for a page (from admin)
         *  WELCOME TO CALLBACK HELL
         *  should I have used promises? yes, I should have used promises.
         *  i don't care. i DON'T care.
         */
        saveBasicFields: function(data, callback) {

          var collisionSearchQuery = function(page_id, shortcode) {
            return {
              where: {
                $and: {
                  id: { $ne: page_id },
                  $or: [
                    { shortcode_fb: { $eq: shortcode } },
                    { shortcode_tw: { $eq: shortcode } },
                  ]
                }
              }
            };
          };

          if (!data.id)
            return callback({ref: 'PAGES_NOT_FOUND'}, null);

          if (data.shortcode_fb == data.shortcode_tw)
            return callback({ref: 'PAGES_SHORTCODE_TAKEN'}, null);

          var qry = collisionSearchQuery(data.id, data.shortcode_fb);

          this.findAll(qry).then(function(models1) {

            if (models1.length != 0)
              return callback({ref: 'PAGES_SHORTCODE_TAKEN'}, null);

            var qry = collisionSearchQuery(data.id, data.shortcode_tw);

            this.findAll(qry).then(function(models2) {

              if (models2.length != 0)
                return callback({ref: 'PAGES_SHORTCODE_TAKEN'}, null);

              this.findById(data.id).then(function(page) {

                if (!page)
                  return callback({ref: 'PAGES_NOT_FOUND'}, null);

                var qry = {
                  id:           data.id,
                  shortcode_fb: data.shortcode_fb,
                  shortcode_tw: data.shortcode_tw,
                  mod_date:     Sequelize.fn('NOW')
                }
                this.update(
                  qry, { where: {id: qry.id}, returning: true }
                ).then(function(data) {
                  if (data.length != '2' || data[1].length != 1)
                    return callback({ref: 'PAGES_UPDATE_ERROR'}, null);

                  callback(null, data[1][0]);
                });
              }.bind(this));
            }.bind(this));
          }.bind(this));
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
        },

        /**
         *  Returns a 'where' query to lookup a page by shortcode
         */
        shortcodeSearchQuery: function(val) {
          return {
            where: {
              $or: [
                { shortcode_fb: { $eq: val } },
                { shortcode_tw: { $eq: val } },
              ]
            }
          }
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
  }, 3000000);
}

module.exports = { _init: _init };

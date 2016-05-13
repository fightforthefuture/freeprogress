module.exports = {
  SERVER_DEFAULT: {
    'msg':  'An internal server error has occurred.',
    'code': 500
  },
  SERVER_S3_SAVE_FAIL: {
    'msg':  'Unable to store file to S3.',
    'code': 500
  },
  USER_UNAUTHORIZED: {
    'msg':  'Access denied.',
    'code': 401
  },
  SITE_UNAUTHORIZED_DOMAIN: {
    'msg':  'This domain is not authorized for Free Progress.',
    'code': 401
  },
  SITE_DOMAIN_SECURITY_SCRAPE_FAIL: {
    'msg':  'An error occured while scraping freeprogress.txt from this domain',
    'code': 400
  },
  TESTS_BAD_URL: {
    'msg':  'An invalid URL was passed.',
    'code': 400
  },
  TESTS_BAD_SHORTCODE: {
    'msg':  'The requested resource could not be found.',
    'code': 404
  },
  TESTS_BAD_IMAGE_UPLOAD: {
    'msg':  'An invalid image was passed.',
    'code': 400
  },
  TESTS_SCRAPE_ERROR: {
    'msg':  'An error occurred while scraping the page.',
    'code': 500
  },
  TESTS_VARIATION_UPDATE_ERROR: {
    'msg':  'An internal error occurred while updating that FB variation.',
    'code': 500
  },
  EMAILS_DISABLED: {
    'msg':  'Email scheduler is disabled for this deployment.',
    'code': 401
  },
  EMAILS_MISSING_EMAIL: {
    'msg':  'Missing email parameter.',
    'code': 400
  },
  EMAILS_MISSING_URL: {
    'msg':  'Missing url paramater.',
    'code': 400
  },
  EMAILS_ACTION_NETWORK_DISABLED: {
    'msg':  'Scheduled email requires Action Network, but integration disabled',
    'code': 500
  },
  EXTERNAL_NETWORK_SUBSCRIBER_LOOKUP_FAIL: {
    'msg':  'Could not lookup subscriber info from external network.',
    'code': 500
  },
  json: function(res, code) {
    if (typeof this[code] === 'undefined')
      code = 'SERVER_DEFAULT';

    res.status(this[code].code);
    return res.json(this[code]);
  }
}

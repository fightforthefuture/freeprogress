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
  TESTS_BAD_URL: {
    'msg':  'An invalid URL was passed.',
    'code': 400
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
  json: function(res, code) {
    if (typeof this[code] === 'undefined')
      code = 'SERVER_DEFAULT';

    res.status(this[code].code);
    return res.json(this[code]);
  }
}

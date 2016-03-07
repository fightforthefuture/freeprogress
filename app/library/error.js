module.exports = {
  SERVER_DEFAULT: {
    'msg':  'An internal server error has occurred.',
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
  TESTS_SCRAPE_ERROR: {
    'msg':  'An error occurred while scraping the page.',
    'code': 500
  },
  json: function(res, code) {
    if (typeof this[code] === 'undefined')
      code = 'SERVER_DEFAULT';

    res.status(this[code].code);
    return res.json(this[code]);
  }
}

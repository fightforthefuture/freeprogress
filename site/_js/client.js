"use strict";

var FreeProgress = {
  data: {
    variation_fb: null,
    variation_tw: null
  },

  apiUrl: '{{SITE_URL}}',

  init: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        try {
          var res = JSON.parse(xhr.response);
          this.data = res;
        } catch(err) {
          console.log('Free Progress failed to load variations.');
        }
      }
    }.bind(this);
    xhr.open("get", this.apiUrl+'/tests?url='+window.location.href, true);
    xhr.send();

    if (
      document.readyState == "complete"
      ||
      document.readyState == "loaded"
      ||
      document.readyState == "interactive"
    )
      this.onDomContentLoaded();

    else if (document.addEventListener)
      document.addEventListener(
        'DOMContentLoaded',
        this.onDomContentLoaded.bind(this),
        false);
  },

  onDomContentLoaded:function() {
    var fb = document.querySelectorAll('button.facebook, a.facebook');
    for (var i = 0; i < fb.length; i++)
      fb[i].addEventListener('click', function(e) {
        e.preventDefault();
        this.share();
      }.bind(this), false);

    var tw = document.querySelectorAll('button.twitter, a.twitter');
    for (var i = 0; i < tw.length; i++)
      tw[i].addEventListener('click', function(e) {
        e.preventDefault();
        this.tweet();
      }.bind(this), false);
  },

  share: function() {
    var baseUrl = 'https://www.facebook.com/sharer/sharer.php?u=';

    if (this.data.variation_fb) {
      var fbUrl = this.data.variation_fb.url;

      var xhr = new XMLHttpRequest();
      xhr.open("post", this.data.variation_fb.url, true);
      xhr.send();
    } else
      var fbUrl = window.location.protocol + '//' + window.location.host
                + window.location.pathname;

    var url = baseUrl + encodeURIComponent(fbUrl);
    var properties = 'width=500, height=300, toolbar=no, status=no, menubar=no';

    window.open(url, 'share_fb', properties);
  },

  tweet: function() {
    var tweet, url, properties;

    if (this.data.variation_tw) {
      tweet = this.data.variation_tw.tweet_text+' '+this.data.variation_tw.url;

      var xhr = new XMLHttpRequest();
      xhr.open("post", this.data.variation_tw.url, true);
      xhr.send();
    } else {
      url   = window.location.protocol + '//' + window.location.host
            + window.location.pathname;

      tweet =  document.querySelector('meta[name="twittertext"]')
            || document.querySelector('meta[name="twitter:text"]');

      tweet = (tweet ? tweet.content : '') + ' ' + url;
    }
    url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet);
    properties = 'width=500, height=300, toolbar=no, status=no, menubar=no';

    window.open(url, 'share_tw', properties);
  },

  convert: function() {
    var
      i,
      pairs,
      queryObject = {},
      queryString = window.location.search;

    if (queryString[0] === '?')
      queryString = queryString.substr(1);

    pairs = queryString.split('&');
    i = pairs.length;

    while (i--)
      queryObject[pairs[i].split('=')[0]] = pairs[i].split('=')[1];

    if (typeof(queryObject['_fp']) === 'undefined')
      return;

    var shortcode = queryObject['_fp'].substr(2),
        testType  = queryObject['_fp'].charAt(0) == 't' ? 'tw' : 'fb',
        xhr       = new XMLHttpRequest(),
        data      = new FormData();

    data.append('shortcode', shortcode);

    xhr.open("post", this.apiUrl+'/tests/convert_variation_'+testType, true);
    xhr.send(data);
  }
};
FreeProgress.init();

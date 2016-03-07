var api = {
  auth: function(xhr) {
    xhr.setRequestHeader("Authorization", "Basic " + btoa(
      "api_key:"+util.getCookie('api_key')
    ));
  },
  error: function(xhr) {

    var msg = 'An internal server error has occurred :(';

    try {
      var json = JSON.parse(xhr.response);
      msg = json.msg;
    } catch(err) {
      console.log(msg, xhr.response);
    }

    var err = {
      msg: msg,
      code: xhr.status,
      response: xhr.response
    };
    console.log('API ERROR:', err);

    return err;
  },
  get: function(url, params, callback) {
    var query = '';

    for (var param in params)
      if (params.hasOwnProperty(param)) {
        if (query.length)
          query += '&';
        else
          query += '?';
        query += encodeURIComponent(param)+'='+encodeURIComponent(params[param])
      }

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status != 200)
          return callback(this.error(xhr), null)

        return callback(null, JSON.parse(xhr.response));
      }
    }.bind(this);
    xhr.open("get", url+query, true);
    this.auth(xhr);
    xhr.send();
  }
}

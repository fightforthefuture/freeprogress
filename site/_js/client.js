"use strict";

var FreeProgress = {
  data: {},
  init: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4)
        {
            var res = JSON.parse(xhr.response);

            console.log('res:',res);
        }
    }.bind(this);
    xhr.open("get", '{{SITE_URL}}/tests?url='+window.location.href, true);
    xhr.send();
  },
  tweet: function() {
    alert('lol');
  }
};
FreeProgress.init();

function createHttp() {
  var xhr = new XMLHttpRequest();
  
  function _sendPostRequest(uri, params, fn) {
    xhr.open("POST", uri, true);
    var formData = new FormData();
    for(var k in params) {
      formData.append(k, params[k]);
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(xhr.status == 200) {
          fn(null, xhr.responseText)
        } else {
          fn(new Error("server return error"), xhr.status);
        }
      }
    }
    xhr.send(formData);    
  }
  
  function _sendGetRequest(uri, params, fn) {
    var queries = [];
    for(var k in params) {
      queries.push(escape(k) + "=" + escape(params[k]));
    }
    xhr.open("GET", uri + "?" + queries.join("&"), true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if(xhr.status == 200) {
          fn(null, xhr.responseText)
        } else {
          fn(new Error("server return error"), xhr.status);
        }
      }
    }
    xhr.send();    
  }
  
  return {
    "retryList": [],
    "post": function(uri, params, fn) {
      _sendPostRequest(uri, params, fn);
    },
    "get": function(uri, params, fn) {
      _sendGetRequest(uri, params, fn);
    }    
  }
}
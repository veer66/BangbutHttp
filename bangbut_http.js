function createHttp() {
  var xhr = new XMLHttpRequest();
  return {
    "retryList": [],
    "post": function(uri, params, fn) {
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
    },
  }
}
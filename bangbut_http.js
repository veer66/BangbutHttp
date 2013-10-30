function createHttp() {
  
  var retryList = [];
  
  function createResponseHandler(xhr, fn, opt, app) {
    return function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          fn(null, xhr.responseText)
        } else if (xhr.status == 401) {
          if (app) {
            if(opt && opt.isLoginRequest) {
              app.authFail();
            } else {              
              retryList.push({url: xhr.url, method: xhr.method, requestBody: xhr.requestBody, callback: fn});
              app.loginRequired();                            
            }
          }
          // xhr.abort();
        } else {
          // xhr.abort();
          fn(new Error("server return error"), xhr.status);
        }
      }            
    };
  }
      
  return {
    "app": null, 
    "upload": function(uri, file, fn) {
      var xhr = new XMLHttpRequest();
      var fd = new FormData();
      xhr.open("POST", uri, true);
      xhr.onreadystatechange = createResponseHandler(xhr, fn, {}, this.app);
      fd.append("file", file);
      xhr.send(fd);
    },
    "post": function(uri, params) {
      var fn, opt;
      if (arguments.length == 4) {
        fn = arguments[3];
        opt = arguments[2];
      } else if (arguments.length == 3) {
        fn = arguments[2];
      }      

      var queries = [];
      for (var k in params) {
        queries.push(escape(k) + "=" + escape(params[k]));
      }
      var queryString = queries.join("&");
      
      var xhr = new XMLHttpRequest();
      
      xhr.open("POST", uri, true);      
      xhr.responseType = "text";
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onreadystatechange = createResponseHandler(xhr, fn, opt, this.app);
      xhr.send(queryString);    
    },
    "get": function(uri, params) {
      var fn, opt;
      if (arguments.length == 4) {
        fn = arguments[3];
        opt = arguments[2];
      } else if (arguments.length == 3) {
        fn = arguments[2];
      }
      
      var xhr = new XMLHttpRequest();
      var queries = [];
      for (var k in params) {
        queries.push(escape(k) + "=" + escape(params[k]));
      }
      var queryString = queries.join("&");
      var uriWithQuery;
      if (queryString.length > 0) 
        uriWithQuery = uri + "?" + queryString;
      else
        uriWithQuery = uri;
              
      xhr.open("GET", uriWithQuery, true);
      xhr.onreadystatechange = createResponseHandler(xhr, fn, opt, this.app);
      xhr.send();    
    },
    "loginConfirmed": function() {
      if (this.app) {
        retryList.forEach(function(retryItem) {
          
          var xhr = new XMLHttpRequest();          
          if (retryItem.method == "GET") {
            xhr.open("GET", retryItem.url, true);
            xhr.onreadystatechange = retryItem.callback;
            xhr.send();
          } else if (retryItem.method == "POST") {
            xhr.open("POST", retryItem.url, true);
            xhr.onreadystatechange = retryItem.callback;
            xhr.send(retryItem.requestBody);
          }
        });
        retryList = [];
        this.app.loginConfirmed();
      }
    }
  }
}
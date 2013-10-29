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
        } else {
          fn(new Error("server return error"), xhr.status);
        }
      }            
    };
  }
      
  return {
    "app": null, 
    "post": function(uri, params) {
      var fn, opt;
      if (arguments.length == 4) {
        fn = arguments[3];
        opt = arguments[2];
      } else if (arguments.length == 3) {
        fn = arguments[2];
      }      
      
      var xhr = new XMLHttpRequest();
      xhr.open("POST", uri, true);
      var formData = new FormData();
      for (var k in params) {
        formData.append(k, params[k]);
      }
      xhr.onreadystatechange = createResponseHandler(xhr, fn, opt, this.app);
      xhr.send(formData);    
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
      xhr.open("GET", uri + "?" + queries.join("&"), true);
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
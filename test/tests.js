"use strict";
describe('BangbutHttp', function(){
  var http;
  var requests;
  var xhr;
  var realFormData;
  
  beforeEach(function () {
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];
    xhr.onCreate = function (req) { 
      requests.push(req); 
    };
    http = createHttp();
    realFormData = global.FormData;
    global.FormData = function FormData_() {
      return {
        "data": [],
        "append": function(key, value) {
          var obj = {};
          obj[key] = value;
          this.data.push(obj);
        }
      }
    }
  });

  afterEach(function () {
    global.FormData = realFormData;
    xhr.restore();
  });
  
  it("should retry permission deny requests", function(done) {
    http.app = {"loginConfirmed": sinon.spy(),
                "loginRequired": sinon.spy()};
    http.post("/titi", {}, function() { 
      done(null); 
    });    
    http.get("/auth", {}, {"isLoginRequest": true}, function(data) {
      http.loginConfirmed();
    });    
      
    requests[0].respond(401, { "Content-Type": "plain/text" }, "Permission deny");    
    requests[1].respond(200, { "Content-Type": "plain/text" }, "OK");
    requests[2].respond(200, { "Content-Type": "plain/text" }, "abc");

  });
  
  describe('post', function() {
    it('should send {x:10} and get abcd back via POST method', function(done) {
      http.post("/titi", {x: 10}, function(err, data) {
        chai.expect(err).to.be.null;
        chai.expect(data).to.equal("abc");
        done(null);
      });
      chai.expect(requests[0].method).to.equal("POST");
      chai.expect(requests[0].requestBody.data[0].x).to.equal(10);
      requests[0].respond(200, { "Content-Type": "plain/text" }, "abc");
    })
    
    describe('auth', function() {
      it("should call loginRequired", function(done) {
        var called = false;
        var app = {"loginRequired": function() { done(null); } };
        http.app = app;
        http.post("/titi", {}, function(err, data) {
          done(new Error("Should not be called"));
        });
        requests[0].respond(401, { "Content-Type": "plain/text" }, "Permission deny");
      });
      
      it("should call authFail when login request is sent but login fail",function(done) {
        var called = false;
        var app = {"authFail": function() { done(null); } };
        http.app = app;
        
        http.post("/auth", {}, {"isLoginRequest": true}, function(err, data) {
                  done(new Error("Should not be called"));
                });
        requests[0].respond(401, { "Content-Type": "plain/text" }, "Permission deny");
      });
      
    });    
    
  })
  
  describe('get', function() {
    it('should send {y:20} and {m:"x"} and get abcd back via GET method', function(done) {
      http.get("/titi", {y: 20, "m": "x"}, function(err, data) {
        chai.expect(err).to.be.null;
        chai.expect(data).to.equal("abc");
        done(null);
      });
      chai.expect(requests[0].method).to.equal("GET");
      chai.expect(requests[0].url).to.equal("/titi?y=20&m=x");
      requests[0].respond(200, { "Content-Type": "plain/text" }, "abc");
    });
    
    describe('auth', function() {
      it("should call loginRequired", function(done) {
        var called = false;
        var app = {"loginRequired": function() { done(null); } };
        http.app = app;
        http.get("/titi", {}, function(err, data) {
          done(new Error("Should not be called"));
        });
        requests[0].respond(401, { "Content-Type": "plain/text" }, "Permission deny");
      });
      
      it("should call authFail when login request is sent but login fail",function(done) {
        var called = false;
        var app = {"authFail": function() { done(null); } };
        http.app = app;
        
        http.get("/auth", {}, {"isLoginRequest": true}, function(err, data) {
                  done(new Error("Should not be called"));
                });
        requests[0].respond(401, { "Content-Type": "plain/text" }, "Permission deny");
      });
    });    
  });    
});

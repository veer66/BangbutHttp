"use strict";
describe('BangbutHttp', function(){
  var http;
  var requests;
  var xhr;
  var realFormData;
  before(function () {
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

  after(function () {
    global.FormData = realFormData;
    xhr.restore();
  });
  
  describe('post', function() {
    it('should send {x:10} and get abcd back via POST method', function(done) {
      http.post("/titi", {x: 10}, function(err, data) {
        chai.expect(err).to.be.null;
        chai.expect(data).to.equal("abc");
        done(null);
      });
      chai.expect(requests[0].method).to.equal("POST")
      chai.expect(requests[0].requestBody.data[0].x).to.equal(10);
      requests[0].respond(200, { "Content-Type": "plain/text" }, "abc");
    })
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
    })
  })
  
})

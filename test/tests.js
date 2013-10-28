"use strict";
describe('BangbutHttp', function(){
  var http;
  var requests;
  var xhr;
  before(function () {
      xhr = sinon.useFakeXMLHttpRequest();
      requests = [];
      xhr.onCreate = function (req) { 
        requests.push(req); 
      };
      http = createHttp();
  });

  after(function () {
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
      requests[0].respond(200, { "Content-Type": "plain/text" }, "abc");
    })
  })
})

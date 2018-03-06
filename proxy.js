const http = require('http');
const request = require('request')
var server = http.createServer(function(req, res, next) {
  req.headers.proxy = true;
	request.post(req);
	res.end();
});

server.listen(9000);
console.log('Magic happens on port 9000');
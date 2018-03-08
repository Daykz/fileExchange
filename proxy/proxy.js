const http = require('http');
const request = require('request');



const proxy = http.createServer(function(req, res) {
  req.headers.proxy = true;
  req.pipe(request(req.url)).pipe(res);
});

proxy.listen(9000);
console.log('Magic happens on port 9000');
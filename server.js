// server.js
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
const { forceDomain } = require('forcedomain');

app = express();
app.use(forceDomain({
  hostname: 'mochi.setsocial.com'
}));

const redirects = {

}

Object.keys(redirects).forEach((key) => {
  const originalUrl = key;
  const newUrl = redirects[key];

  app.get(originalUrl, function (request, response) {
    response.redirect(301, newUrl);
  })
})

app.use(serveStatic(__dirname + '/dist/', {
  extensions: ['html']
}));

// app.use(function (req, res, next) {
//   res.status(404).sendFile(__dirname + '/site/.vuepress/dist/404.html');
// });

var http = require('http').createServer(app);
var port = process.env.PORT || 5000;
http.listen(port);
console.log('server started ' + port);


require('./socket').setupSockets(http);
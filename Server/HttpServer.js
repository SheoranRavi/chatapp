const express = require('express');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');

const PORT = process.env.PORT || 5000;
const INDEX = '/public/index.html';

var app = express();

app.use(function (req, res, next) {
	console.log('requested path ' + req.path);
	next();
})
const staticDir = path.join(__dirname, '/../App')
console.log(staticDir);
app.use(express.static(staticDir));

const indexPath = path.resolve(path.join(staticDir, INDEX));
app.get('/', function (req, res) {
	res.sendFile(indexPath);
})

const certDir = path.join(__dirname, '/../test_cert/');
const options = {
	key: fs.readFileSync(path.join(certDir, 'key.pem')),
	cert: fs.readFileSync(path.join(certDir, 'cert.pem'))
};

// var httpServer = http.createServer(app);
// httpServer.listen(PORT);
var httpsServer = https.createServer(options, app);
httpsServer.listen(PORT);

var host = httpsServer.address().address;
var port = httpsServer.address().port;
console.log("App listening at https://%s:%s", host, port);

module.exports = httpsServer;
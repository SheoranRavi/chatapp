var express = require('express');
const path = require('path');
var app = express();

app.use(function (req, res, next) {
	console.log('requested path ' + req.path);
	next();
})

app.use(express.static('./../App'));

app.get('/', function (req, res) {
	res.send('Hello world');
})

var server = app.listen(80, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
	console.log(app._router.stack);
})
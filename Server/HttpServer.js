var express = require('express');
const path = require('path');
var app = express();
const PORT = process.env.PORT || 5000;

app.use(function (req, res, next) {
	console.log('requested path ' + req.path);
	next();
})
const staticDir = path.join(__dirname, '/../App')
//const staticDir = './../App';
console.log(staticDir);
app.use(express.static(staticDir));

app.get('/', function (req, res) {
	res.send('Hello world');
})

var server = app.listen(PORT, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("App listening at http://%s:%s", host, port);
	//console.log(app._router.stack);
})
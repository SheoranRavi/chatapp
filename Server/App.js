import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as Util from './Util.js';
import { ConnectionManager } from './Services/ConnectionService.js';
import { Routes } from './api-routes/routes.js';
import { staticDir, PORT } from './Model/Constants.js';
import { WebSocketService } from './Services/WebSocketService.js';

const app = createApp(staticDir);
configureMiddlewares(app);
const routes = new Routes();
routes.defineRoutes(app);
const httpServer = createHttpServer(app);
startHttpServer(httpServer, PORT);
var webSocketServer = new WebSocketService(httpServer);

function createApp(staticDir) {
	var app = express();
	return app;
}

function configureMiddlewares(app) {
	app.use(function (req, res, next) {
		console.log('requested path ' + req.path);
		next();
	})
	app.use(express.json());
	app.use(express.static(staticDir));
}

function createHttpServer(app) {
	const __dirname = path.resolve();
	const certDir = path.join(__dirname, '/test_cert/');
	const options = {
		key: fs.readFileSync(path.join(certDir, 'key.pem')),
		cert: fs.readFileSync(path.join(certDir, 'cert.pem'))
	};

	var httpServer = http.createServer(app);
	return httpServer;
}

function startHttpServer(httpServer, PORT) {
	httpServer.listen(PORT);
	// var httpsServer = https.createServer(options, app);
	// httpsServer.listen(PORT);

	var host = httpServer.address().address;
	var port = httpServer.address().port;
	console.log("Http Server listening at https://%s:%s", host, port);
}




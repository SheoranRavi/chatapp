import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import * as Util from './Util.js';
import { ConnectionManager } from './Services/ConnectionService.js';
import { Routes } from './api-routes/routes.js';
import { staticDir, PORT } from './Model/Constants.js';
import { WebSocketService } from './Services/WebSocketService.js';
import { ChatAppController } from './controllers/ChatAppController.js';
import { UsersRepository } from './repository/UsersRepository.js';
import { ChatAppService } from './Services/ChatAppService.js';

const container = Object.create(null);
main();

function main() {
	const app = createApp(staticDir);
	configureMiddlewares(app);
	setupServices(app);
	const httpServer = createHttpServer(app);
	startHttpServer(httpServer, PORT);
	container.connectionManager = new ConnectionManager(container.usersRepository);
	var webSocketServer = new WebSocketService(httpServer, container.connectionManager);
}

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

function setupServices(app) {
	const usersRepository = new UsersRepository();
	const chatAppService = new ChatAppService();
	const chatAppController = new ChatAppController(usersRepository, chatAppService);
	container.usersRepository = usersRepository;
	container.chatAppService = chatAppService;
	const routes = new Routes();
	routes.defineRoutes(app, chatAppController);
}

function createHttpServer(app) {
	const __dirname = path.resolve();
	const certDir = path.join(__dirname, '/test_cert/');
	const options = {
		key: fs.readFileSync(path.join(certDir, 'key.pem')),
		cert: fs.readFileSync(path.join(certDir, 'cert.pem'))
	};

	var httpServer = http.createServer(app);
	console.log("Created http server");
	return httpServer;
}

function startHttpServer(httpServer, PORT) {
	httpServer.listen(PORT);

	var host = httpServer.address().address;
	var port = httpServer.address().port;
	console.log("Http Server listening at http://%s:%s", host, port);
}




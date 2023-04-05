import express from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { ConnectionManager } from './Services/ConnectionService.js';
import { Routes } from './api-routes/routes.js';
import { staticDir, PORT } from './Model/Constants.js';
import { WebSocketService } from './Services/WebSocketService.js';
import { ChatAppController } from './controllers/ChatAppController.js';
import { UsersRepository } from './repository/UsersRepository.js';
import { UsersRepositoryInMemory } from './repository/UsersRepositoryInMemory.js';
import { ChatAppService } from './Services/ChatAppService.js';
import { AuthenticationService } from './Services/AuthenticationService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import log4js from 'log4js';
import * as dotenv from 'dotenv';

const container = Object.create(null);
var __dirname = dirname(fileURLToPath(import.meta.url));
console.log('dirname: ' + __dirname);
main();

async function main() {
	configureEnvironment();
	configureLog4Js();
	const app = createApp(staticDir);
	configureMiddlewares(app);
	await setupServices(app);
	const httpServer = createHttpServer(app);
	startHttpServer(httpServer, PORT);
	container.connectionManager = new ConnectionManager(container.usersRepository);
	var webSocketServer = new WebSocketService(httpServer, container.connectionManager, 
		container.authenticationService);
}

function configureEnvironment(){
	let configPath = path.join(__dirname, './log4js.json');
	console.log('config path: ' + configPath);
	log4js.configure(configPath);
}

function configureLog4Js(){
	let envConfigPath = path.join(__dirname, './config.env');
	dotenv.config({path: envConfigPath});
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

async function setupServices(app) {
	const usersRepository = await getUsersRepository();
	const chatAppService = new ChatAppService();
	const authenticationService = new AuthenticationService(usersRepository);
	const chatAppController = new ChatAppController(chatAppService, authenticationService);
	container.usersRepository = usersRepository;
	container.chatAppService = chatAppService;
	container.authenticationService = authenticationService;
	const routes = new Routes();
	routes.defineRoutes(app, chatAppController);
}

async function getUsersRepository(){
	let repo = new UsersRepository();
	var dbAvailable = await repo.testConnection();
	if(dbAvailable == false){
		repo = new UsersRepositoryInMemory();
		console.log("creating in memory repository");
	}
	repo.init();
	return repo;
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




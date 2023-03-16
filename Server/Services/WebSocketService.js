import { server as WebSocketServer } from 'websocket';
import { ConnectionManager } from './ConnectionService.js';
import { messageType } from '../Model/MessageType.js';
import log4js from 'log4js';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as Util from '../Util.js';
export class WebSocketService {
	constructor(httpServer, connectionManager, authenticationService) {
		this.__dirname = dirname(fileURLToPath(import.meta.url));
		let configPath = path.join(this.__dirname, '../log4js.json');
		log4js.configure(configPath);
		this.logger = log4js.getLogger('WebSocketService');
		this.httpServer = httpServer;
		this.connectionManager = connectionManager;
		this.authenticationService = authenticationService;
		this.parseQueryParams = this.parseQueryParams.bind(this);
		this.onMessage = this.onMessage.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onRequest = this.onRequest.bind(this);
		this.setupWebSocketServer = this.setupWebSocketServer.bind(this);
		this.setupWebSocketServer();
	}

	parseQueryParams(queryString) {
		console.log('typeof queryString: ' + typeof (queryString));
		var vars = queryString.split('&');
		var params = {};
		for (var i = 0; i < vars.length; i++) {
			var pair = vars[i].split('=');
			params[pair[0]] = decodeURIComponent(pair[1]);
		}
		return params;
	}

	onMessage(message) {
		Util.Log("***MESSAGE");
		try {
			if (message.type === 'utf8') {
				Util.Log("Received message: " + message.utf8Data);

				// Process message
				var sendToAllClients = false;
				var sendToOrigin = false;
				const msg = JSON.parse(message.utf8Data);
				var connect = this.connectionManager.getConnectionForID(msg.id);
				// Handle message according to its type
				switch (msg.type) {
					case messageType.Message:
						sendToOrigin = true;
						msg.name = connect.username;
						msg.text = msg.text.replace(/(<([^>]+)>)/ig, "");
						break;
					case messageType.Username:
						var nameChanged = false;
						var origName = msg.name;
						// Force a unique username by appending
						// increasing digits until it's unique.
						while (!this.connectionManager.isUsernameUnique(msg.name)) {
							msg.name = origName + appendToMakeUnique;
							appendToMakeUnique++;
							nameChanged = true;
						}

						if (nameChanged) {
							var changeMsg = {
								id: msg.id,
								type: messageType.RejectUsername,
								name: msg.name
							};
							connect.sendUTF(JSON.stringify(changeMsg));
						}

						connect.username = msg.name;
						this.connectionManager.sendUserListToAll();
						break;
				}
				var sendToTarget = msg.target != undefined;
				var target = msg.target;
				if (sendToTarget !== null) {
					var msgString = JSON.stringify(msg);
					this.connectionManager.sendToTarget(msgString, target, msg.id, sendToOrigin);
				}
				else
					sendToAllClients = true;
				if (sendToAllClients) {
					var msgString = JSON.stringify(msg);
					this.connectionManager.sendToAllClients(msgString);
				}
			}
		}
		catch (e) {
			Util.Log("onMessage Error: " + e);
			this.logger.error(e.stack);
		}
	}

	onClose() {
		Util.Log("***CLOSE");
		this.connectionManager.updateConnections();
		this.connectionManager.sendUserListToAll();
	}

	async onRequest(request) {
		try {
			Util.Log("Handling request from: ", + request.remoteAddress);
			if (!this.connectionManager.originIsAllowed(request.origin)) {
				request.reject();
				Util.Log("Connection from " + request.origin + " rejected.");
				return;
			}
			var resourceUrl = request.resourceURL;
			var queryParams = resourceUrl.query;
			var wsTokenValid = await this.authenticationService.verifyWsToken(queryParams.wsToken);
			
			if (queryParams.userId === null || queryParams.username === null ||
				wsTokenValid !== true) {
				request.reject();
				Util.Log("Connection from " + request.origin + " rejected.");
				return;
			}
			let canAccept = this.connectionManager.canAccept(queryParams.userId);
			if (!canAccept) {
				request.reject();
				Util.Log("User with userId: " + queryParams.userId + " does not exist.");
				Util.Log("Connection from " + request.origin + " rejected.");
				return;
			}
			var connection = request.accept("json", request.origin);
			connection.clientID = queryParams.userId;
			connection.username = queryParams.username;
			Util.Log("Connection Accepted");
			this.connectionManager.addConnection(connection);
			this.connectionManager.sendUserListToAll();
			connection.on('message', this.onMessage);
			connection.on('close', this.onClose);
		}
		catch (e) {
			Util.Log("Error: " + e);
		}
	}

	setupWebSocketServer() {
		var appendToMakeUnique = 1;

		Util.Log("***CREATING WEBSOCKET SERVER");
		var wsServer = new WebSocketServer({
			httpServer: this.httpServer,
			autoAcceptConnections: false
		});

		Util.Log("***CREATED");


		wsServer.on('request', this.onRequest);
		Util.Log("***CREATED REQUEST HANDLER");
	}
}
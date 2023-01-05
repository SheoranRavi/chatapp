import { server as WebSocketServer } from 'websocket';
import { ConnectionManager } from './ConnectionService.js';
import { messageType } from '../Model/MessageType.js';
import * as Util from '../Util.js';
export class WebSocketService {
	constructor(httpServer) {
		this.httpServer = httpServer;
		this.connectionManager = new ConnectionManager();
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
				var sendToClients = true;
				const msg = JSON.parse(message.utf8Data);
				var connect = this.connectionManager.getConnectionForID(msg.id);

				// Handle message according to its type
				switch (msg.type) {
					case messageType.Message:
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

				if (sendToClients) {
					var msgString = JSON.stringify(msg);
					this.connectionManager.sendToAllClients(msgString);
				}
			}
		}
		catch (e) {
			Util.Log("onMessage Error: " + e);
		}
	}

	onClose() {
		Util.Log("***CLOSE");
		this.connectionManager.updateConnections();
		this.connectionManager.sendUserListToAll();
	}

	onRequest(request) {
		try {
			Util.Log("Handling request from: ", + request.remoteAddress);
			if (!this.connectionManager.originIsAllowed(request.origin)) {
				request.reject();
				Util.Log("Connection from " + request.origin + " rejected.");
				return;
			}
			var resourceUrl = request.resourceURL;
			// console.log('request: ');
			// console.dir(request);
			var queryParams = resourceUrl.query;
			if (queryParams.userId === null || queryParams.username === null) {
				request.reject();
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
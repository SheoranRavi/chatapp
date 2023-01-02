import { server as WebSocketServer } from 'websocket';
import { ConnectionManager } from './ConnectionService.js';
import * as Util from '../Util.js';
export class WebSocketService {
	constructor(httpServer) {
		this.httpServer = httpServer;
		this.setupWebSocketServer();
	}

	parseQueryParams(queryString) {
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
		if (message.type === 'utf8') {
			Util.Log("Received message: " + message.utf8Data);

			// Process message
			var sendToClients = true;
			msg = JSON.parse(message.utf8Data);
			var connect = connectionManager.getConnectionForID(msg.id);

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
					while (!connectionManager.isUsernameUnique(msg.name)) {
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
					connectionManager.sendUserListToAll();
					break;
			}

			if (sendToClients) {
				var msgString = JSON.stringify(msg);
				connectionManager.sendToAllClients(msgString);
			}
		}
	}

	onClose() {
		Util.Log("***CLOSE");
		connectionManager.updateConnections();
		connectionManager.sendUserListToAll();
		Util.Log("Peer " + connection.remoteAddress + " disconnected.");
	}

	onRequest(request) {
		Util.Log("Handling request from: ", + request.remoteAddress);
		if (!connectionManager.originIsAllowed(request.origin)) {
			request.reject();
			Util.Log("Connection from " + request.origin + " rejected.");
			return;
		}
		var resourceUrl = request.resourceURL;
		var queryParams = this.parseQueryParams(resourceUrl.query);
		if (queryParams.userId === null) {
			request.reject();
			Util.Log("Connection from " + request.origin + " rejected.");
			return;
		}
		var connection = request.accept("json", request.origin);
		connection.clientID = queryParams.userId;
		Util.Log("Connection Accepted");
		connectionManager.addConnection(connection);
		connectionManager.sendUserListToAll();
		connection.on('message', onMessage);
		connection.on('close', onClose);
	}

	setupWebSocketServer() {
		var appendToMakeUnique = 1;
		const connectionManager = new ConnectionManager();

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
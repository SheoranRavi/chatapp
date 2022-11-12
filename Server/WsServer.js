const WebSocketServer = require('websocket').server;
const messageType = require('./Infra/MessageType');
const http = require('http');
const Util = require('./Util');
const ConnectionManager = require('./Infra/Connection');

const PORT = 6502;
const appendToMakeUnique = 1;
const connectionManager = new ConnectionManager();
var httpServer = http.createServer(function (req, res) {
	Util.Log("Received request for " + req.url);
	res.writeHead(404);
	res.end();
})

httpServer.listen(PORT, function () {
	Util.Log("The server is listening on port " + PORT);
})

Util.Log("***CREATING WEBSOCKET SERVER");
var wsServer = new WebSocketServer({
	httpServer: httpServer,
	autoAcceptConnections: false
});
Util.Log("***CREATED");

var nextID = Date.now();

wsServer.on('request', function (request) {
	Util.Log("Handling request from: ", + request.remoteAddress);
	if (!connectionManager.originIsAllowed(request.origin)) {
		request.reject();
		Util.Log("Connection from " + request.origin + " rejected.");
		return;
	}
	var connection = request.accept("json", request.origin);

	Util.Log("Connection Accepted");
	connectionManager.addConnection(connection);

	connection.clientID = nextID;
	nextID++;

	var msg = {
		type: messageType.Id,
		Id: connection.clientID
	};
	Util.Log("Message type Id: " + messageType.Id);
	Util.Log("Sending msg to client: " + JSON.stringify(msg));
	connection.sendUTF(JSON.stringify(msg));

	connection.on('message', function (message) {
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
	});

	connection.on('close', function (connect) {
		connectionManager.updateConnections();
		connectionManager.sendUserListToAll();
		Util.Log("Peer " + connection.remoteAddress + " disconnected.");
	});
});
Util.Log("***CREATED REQUEST HANDLER");
const { connection } = require("websocket");
const Util = require("../Util");
const messageType = require("../Model/MessageType");

class ConnectionManager{
	constructor(usersRepository) {
		this.connectionArray = [];
		this.usersRepository = usersRepository;
	}

	addConnection(connection) {
		this.connectionArray.push(connection);
	}

	isUsernameUnique(username) {
		var isUnique = true;
		var i;
		for (i = 0; i < this.connectionArray.length; i++){
			if (this.connectionArray[i].username === username) {
				isUnique = false;
				break;
			}
		}
		return isUnique;
	}

	getConnectionForID(id) {
		var connect = null;
		var i;
	  
		for (i=0; i<this.connectionArray.length; i++) {
			if (this.connectionArray[i].clientID === id) {
				connect = this.connectionArray[i];
				break;
			}
		}
		return connect;
	}

	originIsAllowed(origin) {
		return true;
	}

	makeUserListMessage() {
		var usrListMsg = {
			type: messageType.UserList,
			users: []
		};
		var i;
		// add users to the list
		for (i = 0; i < this.connectionArray.length; i++){
			usrListMsg.users.push(this.connectionArray[i].username);
		}
		return usrListMsg;
	}

	sendUserListToAll() {
		var userListMessage = this.makeUserListMessage();
		var userListMessageString = JSON.stringify(userListMessage);
		var i;
		Util.Log("Sending user list to all clients");
		for (i = 0; i < this.connectionArray.length; i++){
			this.connectionArray[i].sendUTF(userListMessageString);
		}
	}

	sendToAllClients(msgString) {
		var i;
		for (i = 0; i < this.connectionArray.length; i++){
			this.connectionArray[i].sendUTF(msgString);
		}
	}

	updateConnections() {
		this.connectionArray = this.connectionArray.filter(function (el, idx, arr) {
			return el.connected;
		})
	}
}

module.exports = ConnectionManager;
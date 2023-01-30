import * as Util from "../Util.js";
import { messageType } from "../Model/MessageType.js";

export class ConnectionManager{
	constructor(usersRepository) {
		this.connectionArray = [];
		this.usersRepository = usersRepository;
		this.addConnection = this.addConnection.bind(this);
		this.isUsernameUnique = this.isUsernameUnique.bind(this);
		this.getConnectionForID = this.getConnectionForID.bind(this);
		this.originIsAllowed = this.originIsAllowed.bind(this);
		this.makeUserListMessage = this.makeUserListMessage.bind(this);
		this.sendToAllClients = this.sendToAllClients.bind(this);
		this.updateConnections = this.updateConnections.bind(this);
		this.canAccept = this.canAccept.bind(this);
	}

	canAccept(userId) {
		let user = this.usersRepository.getUser(userId);
		if (user == null) {
			return false;
		}
		return true;
	}

	addConnection(connection) {
		console.log('adding connection to collection:');
		console.dir(connection);
		this.connectionArray.push(connection);
		console.log('length of connectionArray: ' + this.connectionArray.length);
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
		console.log('length of connectionArray: ' + this.connectionArray.length);
		console.log('looking for connection with id: ' + id);
		console.log('typeof id: ' + typeof (id));
	  
		for (i = 0; i < this.connectionArray.length; i++) {
			console.log('connection ID current: ' + this.connectionArray[i].clientID);
			console.log('typeof connection ID current: ' + typeof (this.connectionArray[i].clientID));

			if (this.connectionArray[i].clientID == id) {
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
		console.log(messageType.UserList);
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
		console.dir(userListMessageString);
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
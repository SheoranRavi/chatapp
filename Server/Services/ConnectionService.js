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
	  
		for (i = 0; i < this.connectionArray.length; i++) {
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
		const usersSet = new Set();
		var i;
		// add users to the list
		for (i = 0; i < this.connectionArray.length; i++){
			if (!usersSet.has(this.connectionArray[i].clientID)) {
				let user = {
					username: this.connectionArray[i].username,
					id: this.connectionArray[i].clientID
				};
				usrListMsg.users.push(user);
				usersSet.add(this.connectionArray[i].clientID);
			}
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

	sendToTarget(msgString, target, id) {
		var i;
		for (i = 0; i < this.connectionArray.length; i++){
			if (this.connectionArray[i].clientID == target || 
				this.connectionArray[i].clientID == id) {
				this.connectionArray[i].sendUTF(msgString);
			}
		}
	}

	updateConnections() {
		this.connectionArray = this.connectionArray.filter(function (el, idx, arr) {
			return el.connected;
		})
	}
}
import React from 'react';
import ChatMessages from '../ChatMessages/ChatMessages.js';
import ChatInput from '../ChatInput/ChatInput.js';
import Sidebar from '../Sidebar/Sidebar.js';
import DialogueBox from '../DialogueBox/DialogueBox.js';
import './ChatApp.css';

class ChatApp extends React.Component {
	
	constructor(props) {
		super(props);
		console.log("ChatApp props: ", props);
		this.state = {
			messages: [],
			userId: props.userId
		};
		this.connection = null;
		this.state.users = [
			{ id: 1, name: 'Ravi' },
			{ id: 2, name: 'Nalisha' },
			{ id: 3, name: 'Vishal' },
			{ id: 4, name: 'Some very long name' }
		];
	}

	send() {
		console.log("***SEND");
		var msg = {
			text: document.getElementById("text").value,
			type: "message",
			id: clientId,
			date: Date.now()
		};
		connection.send(JSON.stringify(msg));
		document.getElementById("text").value = "";
	}

	handleSubmit = event => {
		event.preventDefault();
		// Get the message text from the input field
		const input = event.target.elements[0];
		const text = input.value;

		// Clear the input field
		input.value = '';
		this.send();
		// Add the message to the array of messages
		this.setState(prevState => ({
			messages: [...prevState.messages, { id: Date.now(), text, sender: 'Me' }],
		}));
	};

	setUsername() {
		console.log("***SET USERNAME");
		var msg = {
			name: this.props.username,
			date: Date.now(),
			id: clientId,
			type: "username"
		};
		console.log("Sending username to server: " + console.dir(msg));
		connection.send(JSON.stringify(msg));
	}

	componentDidMount() {
		var serverUrl;
		var scheme = "ws";

		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;
		var queryParams = 'userId=' + this.state.userId;
		serverUrl += "?" + queryParams;
		this.connection = new WebSocket(serverUrl, "json");
		console.log("***CREATED WEBSOCKET");

		this.connection.onmessage = function (evt) {
			console.log("***ONMESSAGE");
			var text = "";
			var msg = JSON.parse(evt.data);
			console.log("Message received: ");
			console.dir(msg);
			var time = new Date(msg.date);
			var timeStr = time.toLocaleTimeString();

			switch (msg.type) {
				case "id":
					clientId = msg.Id;
					this.setUsername();
					break;
				case "username":
					text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
					break;
				case "message":
					text = "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.text + "<br>";
					break;
				case "rejectusername":
					text = "<b>Your username has been set to <em>" + msg.name + "</em> because the name you chose is in use.</b><br>";
					break;
				case "userList":
					var i;
					for (i = 0; i < msg.users.length; ++i) {
						this.setState(prevState => ({
							users: [...prevState.users, { id: this.state.users.length + 1, name: msg.users[i] }]
						}));
					}
					break;
			}

			if (text.length) {
				this.setState(prevState => ({
					messages: [...prevState.messages, { id: Date.now(), text, sender: msg.name }]
				}));
			}
		};
		console.log("***CREATED ONMESSAGE");

		this.props.connection.onopen = function (evt) {
			console.log("***ONOPEN");
		};
		console.log("***CREATED ONOPEN");
	}

	render() {
		
		return (
			<div className="chat-app">
				<Sidebar activeUsers={this.state.users} />
				<DialogueBox />
				<ChatMessages messages={this.state.messages} />
				<ChatInput onSubmit={this.handleSubmit} />
			</div>
		);
	}
}

export default ChatApp;
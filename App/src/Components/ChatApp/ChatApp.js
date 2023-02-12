import React from 'react';
import ChatMessages from '../ChatMessages/ChatMessages.js';
import ChatInput from '../ChatInput/ChatInput.js';
import Sidebar from '../Sidebar/Sidebar.js';
import DialogueBox from '../DialogueBox/DialogueBox.js';
import VideoPlayer from '../VideoPlayer/VideoPlayer.js';
import './ChatApp.css';

class ChatApp extends React.Component {

	constructor(props) {
		super(props);
		console.log("ChatApp props: ", props);
		var location = this.props.location;
		console.log("ChatApp location: ", location);
		this.state = {
			messages: [],
			users: [],
			curretTarget: null,
			inCall: false
		};
		this.connection = null;
		this.send = this.send.bind(this);
		this.setUsername = this.setUsername.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
	}

	send(text) {
		console.log("***SEND");
		console.log("Sending message to server with userId: " + this.props.userId);
		var msg = {
			text: text,
			type: "message",
			id: this.props.userId,
			username: this.props.username,
			target: this.state.curretTarget,
			date: Date.now()
		};
		this.connection.send(JSON.stringify(msg));
	}

	handleSubmit = event => {
		event.preventDefault();
		// Get the message text from the input field
		const input = event.target.elements[0];
		const text = input.value;

		// Clear the input field
		input.value = '';
		this.send(text);
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
		this.connection.send(JSON.stringify(msg));
	}

	componentDidMount() {
		if (this.connection != null)
			return;
		var serverUrl;
		var scheme = "ws";

		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;
		var queryParams = 'userId=' + this.props.userId + '&username=' + this.props.username;
		serverUrl += "?" + queryParams;
		this.connection = new WebSocket(serverUrl, "json");
		console.log("***CREATED WEBSOCKET");

		this.connection.onmessage = function (evt) {
			console.log("***ONMESSAGE");
			var msg = JSON.parse(evt.data);
			console.log("Message received: ");
			console.dir(msg);
			var time = new Date(msg.date);
			var timeStr = time.toLocaleTimeString();
			var message = {};

			switch (msg.type) {
				case "message":
					message.id = Date.now();
					message.userId = msg.id;
					message.time = timeStr;
					message.text = msg.text;
					message.sender = msg.name;
					break;
				case "userList":
					var i;
					var newUsers = []
					for (i = 0; i < msg.users.length; ++i) {
						const user = {
							id: this.state.users.length + 1,
							name: msg.users[i].username,
							userId: msg.users[i].id
						};
						if(user.userId != this.props.userId)
							newUsers.push(user);
					}
					this.setState({ users: newUsers });
					break;
			}
			if (message.text) {
				this.setState(prevState => ({
					messages: [...prevState.messages, message]
				}));
			}
		};
		this.connection.onmessage = this.connection.onmessage.bind(this);
		console.log("***CREATED ONMESSAGE");

		this.connection.onopen = function (evt) {
			console.log("***ONOPEN");
		};
		console.log("***CREATED ONOPEN");
	}

	setCurrentTarget = (userId) => {
		console.log("***SET CURRENT TARGET");
		this.setState({ curretTarget: userId });
	}

	videoCallCallback = (userId) => {
		console.log("***VIDEO CALL CALLBACK");
		this.setState({ inCall: true });
	}

	hangUpCallback = () => {
		this.setState({ inCall: false });
	}

	render() {

		return (
			<div className="chat-app">
				<div className='bg-secondary text-white text-center'>
					{this.state.curretTarget !== null &&
						<p>Connected to {this.state.users.filter((val) => {
							return val.userId === this.state.curretTarget;
						}).at(0).name}</p>
					}
				</div>
				<div className='row-users-messages'>
					<Sidebar activeUsers={this.state.users}
						setCurrentTarget={this.setCurrentTarget}
					/>
					<DialogueBox messages={this.state.messages}
						userId={this.props.userId} 
						videoCallCallback={this.videoCallCallback}
						/>
				</div>
				{this.state.inCall &&
					<VideoPlayer hangUpCallback={this.hangUpCallback}></VideoPlayer>
				}
				<ChatInput onSubmit={this.handleSubmit} disabled={this.state.curretTarget === null} />
				{this.state.curretTarget === null &&
					<div>
						<p>Choose a user to start chatting</p>
					</div>
				}
			</div>
		);
	}
}

export default ChatApp;
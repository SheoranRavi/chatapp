import React from 'react';
import ChatInput from '../Components/ChatInput/ChatInput.js';
import Sidebar from '../Components/Sidebar/Sidebar.js';
import DialogueBox from '../Components/DialogueBox/DialogueBox.js';
import VideoPlayer from '../Components/VideoPlayer/VideoPlayer.js';
import { Navigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import './Home.css';
import { toast, ToastContainer } from 'react-toastify';

class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			messages: [],
			users: [],
			curretTarget: null,
			inCall: false,
			localStream: null,
			remoteStream: null,
            navigateToLogin: false
		};
		this.peerConnection = null;
		this.connection = null;
		this.userId = null;
		this.username = null;
		this.send = this.sendTextMesssage.bind(this);
		this.setUsername = this.setUsername.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
	}

	sendTextMesssage(text) {
		console.log("***SEND");
		console.log("Sending message to server with userId: " + this.userId);
		var msg = {
			text: text,
			type: "message",
			id: this.userId,
			username: this.username,
			target: this.state.curretTarget,
			date: Date.now()
		};
		this.connection.send(JSON.stringify(msg));
	}

	sendToServer = (msg) => {
		const msgJSON = JSON.stringify(msg);
		this.connection.send(msgJSON);
	}

	handleSubmit = event => {
		event.preventDefault();
		// Get the message text from the input field
		const input = event.target.elements[0];
		const text = input.value;

		// Clear the input field
		input.value = '';
		this.sendTextMesssage(text);
	};

	setUsername() {
		console.log("***SET USERNAME");
		var msg = {
			name: this.username,
			date: Date.now(),
			id: clientId,
			type: "username"
		};
		console.log("Sending username to server: " + console.dir(msg));
		this.connection.send(JSON.stringify(msg));
	}

	getWsToken = async (httpToken) => {
		try{
			const response = await fetch('/getWSToken', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + httpToken
				}
			});
			const body = await response.json();
			if (response.status !== 200) throw Error('httpToken has expired, re-login');
			return body.wsToken;
		}
		catch (e){
			console.log('error in getWsToken');
			console.log(e);
			this.setState({navigateToLogin: true});
			return "";
		}
	}

	setupWebSocket = async () => {
		let httpToken = this.getTokenFromSession();
        this.getStateFromSessionStorage();
		if (this.connection != null)
			return;
		var serverUrl;
		var scheme = "ws";
		var wsToken = await this.getWsToken(httpToken);
		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;
		var queryParams = 'userId=' + this.userId + '&username=' + this.username + 
			'&wsToken=' + wsToken;
		serverUrl += "?" + queryParams;
		this.connection = new WebSocket(serverUrl, "json");
		console.log("***CREATED WEBSOCKET");

		this.connection.onclose = (evt) => {
			console.log("***ONCLOSE");
			console.log("Connection closed.");
			toast("Connection closed, please refresh page.", {
				position: toast.POSITION.TOP_CENTER,
				autoClose: false
			});
		}

		this.connection.onmessage = function (evt) {
			console.log("***ONMESSAGE");
			var msg = JSON.parse(evt.data);
			console.log("Message received: ", msg.type);
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
						if(user.userId != this.userId)
							newUsers.push(user);
					}
					this.setState({ users: newUsers });
					this.validateCurrentTarget();
					break;
				case "new-ice-candidate":
					this.handleNewICECandidateMsg(msg);
					break;
				case "video-offer":
					this.handleVideoOfferMsg(msg);
					break;
				case "video-answer":
					this.handleVideoAnswerMsg(msg);
					break;
				case "hang-up":
					this.handleHangUpMsg(msg);
					break;
				default:
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

	componentDidMount() {
		console.log('called componentDidMount');

        this.setupWebSocket();
	}

	validateCurrentTarget = () => {
		if (this.state.users.filter((val) => val.userId == this.state.curretTarget).length == 0) {
			this.setState({ curretTarget: null });
		}
	}

	handleVideoAnswerMsg = (msg) => {
		console.log("***HANDLE VIDEO ANSWER MSG");
		var desc = new RTCSessionDescription(msg.sdp);
		this.peerConnection.setRemoteDescription(desc).catch(this.reportError);
	}

	handleHangUpMsg = (msg) => {
		console.log("***HANDLE HANG UP MSG");
		this.closeVideoCall();
		this.setState({ inCall: false });
	}

	setCurrentTarget = (userId) => {
		console.log("***SET CURRENT TARGET");
		this.setState({ curretTarget: userId });
	}

	videoCallCallback = async (userId) => {
		console.log("***VIDEO CALL CALLBACK");
		if (this.peerConnection) {
			alert("You can't start a call because you already have one open!!");
			return;
		}
		let mediaConstraints = {
			audio: true,
			video: true
		};
		await this.createPeerConnection();
		navigator.mediaDevices
			.getUserMedia(mediaConstraints)
			.then((localStream) => {
				localStream
					.getTracks()
					.forEach((track) => this.peerConnection.addTrack(track, localStream));
				this.setState({ localStream: localStream });
			})
			.catch(this.handleGetUserMediaError);				
		this.setState({ inCall: true });
	}

	handleGetUserMediaError = (e) => {
		console.log("***HANDLE GET USER MEDIA ERROR");
		switch (e.name) {
			case "NotFoundError":
				alert("Unable to open your call because no camera and/or microphone were found");
				break;
			case "SecurityError":
			case "PermissionError":
				break;
			default:
				alert("Error opening your camera and/or microphone: " + e.message);
				break;
		}
		this.closeVideoCall();
	}

	createPeerConnection = async () => {
		console.log("***CREATE PEER CONNECTION");
		this.peerConnection = new RTCPeerConnection({
			iceServers: [
				{
					urls: "stun:stun.stunprotocol.org",
				},
			],
		});

		this.peerConnection.onicecandidate = this.handleICECandidateEvent;
		this.peerConnection.ontrack = this.handleTrackEvent;
		this.peerConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;
		this.peerConnection.onremovetrack = this.handleRemoveTrackEvent;
		this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
		this.peerConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
		this.peerConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
	}

	handleSignalingStateChangeEvent = (event) => {
		console.log("***HANDLE SIGNALLING STATE CHANGE EVENT");
		console.log(`Signaling state changed to: ${this.peerConnection.signalingState}`);
		if(this.peerConnection.signalingState == "closed")
			this.closeVideoCall();
	}

	handleICEGatheringStateChangeEvent = (event) => {
		console.log("***HANDLE ICE GATHERING STATE CHANGE EVENT");
		console.log('ICE gathering state changed to: ', this.peerConnection.iceGatheringState);
	}

	handleNegotiationNeededEvent = async (event) => {
		console.log("***HANDLE NEGOTIATION NEEDED EVENT");
		try {
			var offer = await this.peerConnection.createOffer();
			await this.peerConnection.setLocalDescription(offer);
			// if (this.peerConnection.signalingState != "stable") {
			// 	console.log("The connection isn't stable yet; postponing sending the offer");
			// 	return;
			// }
			console.log("offer: ");
			console.dir(offer);
			console.log("Current signalling state: " + this.peerConnection.signalingState);
			console.log("localDescription created: " + this.peerConnection.localDescription);
			this.sendToServer({
				id: this.userId,
				target: this.state.curretTarget,
				type: "video-offer",
				sdp: this.peerConnection.localDescription,
			});
		}
		catch (err) {
			this.reportError(err);
		}
	}

	handleVideoOfferMsg = async (msg) => {
		console.log("***HANDLE VIDEO OFFER MSG");
		if (this.peerConnection) {
			console.log("Peer connection already exists, something is wrong");
			return;
		}
		
		await this.createPeerConnection();
		let mediaConstraints = {
			audio: true,
			video: true
		};
		
		const desc = new RTCSessionDescription(msg.sdp);
		this.peerConnection
			.setRemoteDescription(desc)
			.then(() => navigator.mediaDevices.getUserMedia(mediaConstraints))
			.then((localStream) => {
				localStream
					.getTracks()
					.forEach((track) => this.peerConnection.addTrack(track, localStream));
				this.setState({ localStream: localStream });

			})
			.then(() => this.peerConnection.createAnswer())
			.then((answer) => this.peerConnection.setLocalDescription(answer))
			.then(() => {
				this.sendToServer({
					id: this.userId,
					target: msg.id,
					type: "video-answer",
					sdp: this.peerConnection.localDescription,
				});
			})
			.catch(this.handleGetUserMediaError);
		this.setState({ inCall: true });
	}

	handleICECandidateEvent = (event) => {
		console.log("***HANDLE ICE CANDIDATE EVENT");
		if (event.candidate) {
			this.sendToServer({
				type: "new-ice-candidate",
				target: this.state.curretTarget,
				candidate: event.candidate
			});
		}
	}

	handleNewICECandidateMsg = async (msg) => {
		console.log("***HANDLE NEW ICE CANDIDATE MSG");
		const candidate = new RTCIceCandidate(msg.candidate);
		try {
			if (this.peerConnection)
				await this.peerConnection.addIceCandidate(candidate);
			else
				console.log("***handleNewICECandidate called without creating RTCPeerConnection");
		} catch (e) {
			this.reportError(e);
		}
	}

	handleTrackEvent = (event) => {
		console.log("***HANDLE TRACK EVENT");
		const remoteStream = event.streams[0];
		this.setState({ remoteStream: remoteStream });
	}

	closeVideoCall = () => {
		console.log("***CLOSE VIDEO CALL");
		if (this.peerConnection) {
			this.peerConnection.ontrack = null;
			this.peerConnection.onremovetrack = null;
			this.peerConnection.onremovestream = null;
			this.peerConnection.onicecandidate = null;
			this.peerConnection.oniceconnectionstatechange = null;
			this.peerConnection.onsignalingstatechange = null;
			this.peerConnection.onicegatheringstatechange = null;
			this.peerConnection.onnegotiationneeded = null;
		}
		if (this.state.localStream) {
			this.state.localStream.getTracks().forEach((track) => track.stop());
		}
		if (this.state.remoteStream) {
			this.state.remoteStream.getTracks().forEach((track) => track.stop());
		}
		this.setState({ localStream: null, remoteStream: null });
		this.peerConnection.close();
		this.peerConnection = null;
	}

	handleICEConnectionStateChangeEvent = (event) => {
		console.log("***HANDLE ICE CONNECTION STATE CHANGE EVENT");
		switch (this.peerConnection.iceConnectionState) {
			case "closed":
			case "failed":
				this.closeVideoCall();
				break;
		}
	}

	hangUpCallback = () => {
		console.log("***HANG UP CALLBACK");
		this.setState({ inCall: false });
		this.closeVideoCall();
		this.sendToServer({
			id: this.userId,
			target: this.state.curretTarget,
			type: "hang-up"
		});
	}

	handleRemoveTrackEvent = (event) => {
		const stream = this.state.remoteStream;
		const trackList = stream.getTracks();

		if (trackList.length === 0) {
			this.closeVideoCall();
		}
	}

	reportError = (error) => {
		console.log("***REPORT ERROR");
		console.trace(error.name + ': ' + error.message);
	}

    getTokenFromSession = () => {
        if(!this.tokenIsValid()){
			console.log('token is not valid');
            this.setState({ navigateToLogin: true });
        }
		let token = sessionStorage.getItem('token');
		return token;
    }

	tokenIsValid = () => {
		let token = sessionStorage.getItem('token');
		if(token === undefined || token === null){
			return false;
		}
		let decoded = jwt_decode(token);
		let exp = decoded.exp;
		let currentTime = Math.floor(Date.now() / 1000);
		if(exp < currentTime){
			return false;
		}
		return true;
	}

    getStateFromSessionStorage = async () => {
        let userId = sessionStorage.getItem('userId');
        let username = sessionStorage.getItem('username');
		this.userId = userId;
		this.username = username;
    }

	render() {
        if(this.state.navigateToLogin === true){
            return <Navigate to='/login' />
        }
		return (
			<div className="chat-app">
				<div className='bg-secondary text-white text-center'>
					{this.state.curretTarget !== null &&
						<p>Connected to {this.state.users.filter((val) => {
							return val.userId === this.state.curretTarget;
						}).at(0)?.name}</p>
					}
				</div>
				<div className='row-users-messages'>
					<Sidebar activeUsers={this.state.users}
						setCurrentTarget={this.setCurrentTarget}
					/>
					<DialogueBox messages={this.state.messages}
						userId={this.userId} 
						videoCallCallback={this.videoCallCallback}
						/>
				</div>
				{this.state.inCall &&
					<VideoPlayer
						hangUpCallback={this.hangUpCallback}
						localStream={this.state.localStream}
						remoteStream={this.state.remoteStream}>
					</VideoPlayer>
				}
				<ChatInput onSubmit={this.handleSubmit} disabled={this.state.curretTarget === null} />
				{this.state.curretTarget === null &&
					<div>
						<p>Choose a user to start chatting</p>
					</div>
				}
				<ToastContainer/>
			</div>
		);
	}
}

export default Home;
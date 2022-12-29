import React from 'react';
import { Navigate } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import ChatApp from '../Components/ChatApp/ChatApp';
import './SignUp.css';

class SignUp extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			isLoggedIn: false
		};

		this.connection = null;

		this.SignupCompleteEvent = new Event("SignupComplete");
		document.addEventListener('SignupComplete', function (event) {
			console.log("Signup complete!!");
		})
	}

	handleUsernameChange = (event) => {
		this.setState({ username: event.target.value });
	}

	handleClick() {
		
		var serverUrl;
		var scheme = "ws";

		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;

		this.connection = new WebSocket(serverUrl, "json");
		console.log("***CREATED WEBSOCKET");

		this.setState(state => ({
			username: document.getElementById('username').value,
			isLoggedIn: !state.isLoggedIn
		}));

		document.dispatchEvent(this.SignupCompleteEvent);
	}

	render() {
		if (this.state.isLoggedIn) {
			return <ChatApp username={this.state.username} connection={this.connection} />
		}
		return (
			<div>
				<div>
					<input id='username' className="username-input" type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
				</div>
				<button className="login-button" onClick={() => this.handleClick()}>
					{this.state.isLoggedIn ? 'Log Out' : 'Log In'}
				</button>
			</div>
		)
	}
}

export default SignUp;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
import ChatApp from '../Components/ChatApp/ChatApp.js';
import './SignUp.css';

class SignUp extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			userId: null,
			isLoggedIn: false,
			usernameUnique: true,
			errorInLoginRequest: false
		};
		this.handleClick = this.handleClick.bind(this);
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
		var scheme = "http";

		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;
		var loginRequestUri = "/login";
		var loginRequest = serverUrl + loginRequestUri;

		var xhr = new XMLHttpRequest();
		xhr.open("POST", loginRequest);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function(){
			console.log("Login response: " + xhr.responseText);
			if (xhr.status === 200) {
				var response = JSON.parse(xhr.responseText);
				var loginSuccess = response.success;
				if (loginSuccess) {
					console.log("Login successful");
					this.setState({
						usernameUnique: true,
						userId: response.user.userId,
						isLoggedIn: true
					});
				}
				else {
					console.log("Login failed");
					this.setState({ usernameUnique: false });
				}
			}
			else {
				console.log("Error in login request");
				this.setState({ errorInLoginRequest: true });
			}
		}
		xhr.send(JSON.stringify({ username: this.state.username }));

	}

	render() {
		if (this.state.isLoggedIn) {
			return <ChatApp username={this.state.username} userId={ this.state.userId}  />
		}
		return (
			<div>
				<div>
					<input id='username' className="username-input" type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
				</div>
				{!this.state.usernameUnique && 
					<p className="username-unique">Username is not unique, please pick a different username</p>
				}
				{
					this.state.errorInLoginRequest &&
					<p>The login request failed, something wrong with the server</p>
				}
				<button className="login-button" onClick={() => this.handleClick()}>
					{this.state.isLoggedIn ? 'Log Out' : 'Log In'}
				</button>
			</div>
		)
	}
}

export default SignUp;
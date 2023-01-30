import React from 'react';
import { ToastContainer, toast } from 'react-toastify'
import { Navigate } from 'react-router-dom';
import "react-toastify/dist/ReactToastify.css";
import './SignUp.css';

class SignUp extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			userId: null,
			signUpSuccessful: false,
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

	handlePasswordChange = (event) => {
		this.setState({ password: event.target.value });
	}

	handleClick() {
		var serverUrl;
		var scheme = "http";

		if (document.location.protocol === "https:") {
			scheme += "s";
		}

		serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;
		var loginRequestUri = "/signup";
		var loginRequest = serverUrl + loginRequestUri;

		var xhr = new XMLHttpRequest();
		xhr.open("POST", loginRequest);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function () {
			console.log("Login response: " + xhr.responseText);
			console.log("xhr.status: " + xhr.status);
			if (xhr.status === 200) {
				var response = JSON.parse(xhr.responseText);
				var loginSuccess = response.success;
				console.dir(response);
				console.log(loginSuccess);
				console.log(response.success);
				console.log(response['success']);
				if (loginSuccess) {
					console.log("Signup successful");
					this.setState({
						signUpSuccessful: true
					});
				}
				else {
					console.log("Signup failed");
					this.setState({ usernameUnique: false });
					toast('Username already exists, pick different username');
					console.log('Singup response: ' + response);
					if (response.message) {
						toast(response.message);
					}
				}
			}
			else {
				console.log("Error in signup request");
				this.setState({ errorInLoginRequest: true });
			}
		}
		xhr.onload = xhr.onload.bind(this);
		xhr.send(JSON.stringify({ username: this.state.username, password: this.state.password }));

	}

	render() {
		if (this.state.signUpSuccessful) {
			console.log("Rerendering");
			return <Navigate to="/" />
			//return <ChatApp username={this.state.username} userId={this.state.userId} />
		}
		return (
			<div className='main-container'>
				<div>
					<div>
						<h1 className='login-header'>Signup</h1>
					</div>
					<form onSubmit={this.handleSubmit}>
						<input id='username' className="login-input username" type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
						<input id='password' className="login-input password" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
					</form>
				</div>
				<ToastContainer />
				<button className="login-button" onClick={() => this.handleClick()}>
					Create Account
				</button>
			</div>
		)
	}
}

export default SignUp;
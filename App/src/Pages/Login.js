import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'
import Home from '../Pages/Home.js';
import jwt_decode from 'jwt-decode';
import { Segment, Form, Grid, Header, Message, Dropdown } from 'semantic-ui-react';
import './SignUp.css';
import './Login.css';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			userId: null,
			isLoggedIn: false,
			errorInLoginRequest: false
		};
		this.LoginCompleteEvent = new Event("LoginComplete");
		document.addEventListener('LoginComplete', function (event) {
			console.log("Login complete!!");
		});
	}

	handleUsernameChange = (event) => {
		this.setState({ username: event.target.value });
	}

	handlePasswordChange = (event) => {
		this.setState({ password: event.target.value });
	}
	
	handleSubmit = (event) => {
		event.preventDefault();
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
		xhr.onload = function () {
			console.log("Login response: " + xhr.responseText);
			console.log("xhr.status: " + xhr.status);
			if (xhr.status === 200) {
				var response = JSON.parse(xhr.responseText);
				var loginSuccess = response.success;
				console.log(loginSuccess);
				if (loginSuccess === true) {
					var decodedToken = jwt_decode(response.token);
					var user = decodedToken;
					console.log("decoded token: ", decodedToken);
					console.log("Login successful");
					sessionStorage.setItem('token', response.token);
					this.setState({
						userId: user.id,
						isLoggedIn: true
					});
					sessionStorage.setItem('userId', user.id);
					sessionStorage.setItem('username', this.state.username);
					document.dispatchEvent(this.LoginCompleteEvent);
				}
				else {
					if (response.errorResponse.errorField != null) {
						toast(response.errorResponse.message);
					}
					else if (response.status != null && response.status == 500) {
						this.setState({ errorInLoginRequest: true });
						toast('Server Error');	
					}
					else {
						toast('Unknown Error');
					}
					console.log("Login failed");
					console.log('Login response: ' + response);
				}
			}
			else {
				console.log("Error in login request");
				this.setState({ errorInLoginRequest: true });
			}
		}
		xhr.onload = xhr.onload.bind(this);
		xhr.send(JSON.stringify({ username: this.state.username, password: this.state.password }));

	}

	render() {
		if (this.state.isLoggedIn) {
			return <Navigate to='/'
			replace={true}></Navigate>
		}
		return (
			<div className='main-container'>
				<div>
					<div>
						<h1 className='login-header'>Login</h1>
					</div>
					<form onSubmit={this.handleSubmit}>
						<input id='username' className="login-input username" type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
						<input id='password' className="login-input password" type="password" placeholder="Password" value={this.state.password} onChange={this.handlePasswordChange} />
					</form>
				</div>
				<ToastContainer />
				<button className="login-button shadow" onClick={(event) => this.handleSubmit(event)}>
					{this.state.isLoggedIn ? 'Log Out' : 'Login'}
				</button>
				<div className='button'>
					<Link to='/signup' className='btn btn-success shadow small'>Create New Account</Link>
				</div>
			</div>
		)
	}
}

export default Login;

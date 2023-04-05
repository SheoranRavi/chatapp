import React from 'react';
import { ToastContainer, toast } from 'react-toastify'
import { Navigate } from 'react-router-dom';
import { FormErrors } from '../Components/FormErrors/FormErrors.js';
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
			errorInLoginRequest: false,
			passwordValid: false,
			usernameValid: false,
			formValid: false,
			formErrors: { username: '', password: '' }
		};
		this.handleClick = this.handleClick.bind(this);
		this.SignupCompleteEvent = new Event("SignupComplete");
		document.addEventListener('SignupComplete', function (event) {
			console.log("Signup complete!!");
		})
	}

	handleUsernameChange = (event) => {
		this.validateField('username', event.target.value);
		this.setState({ username: event.target.value });
	}

	handlePasswordChange = (event) => {
		this.validateField('password', event.target.value);
		this.setState({ password: event.target.value });
	}

	validateField = (name, value) => {
		let usernameValid = this.state.usernameValid;
		let passwordValid = this.state.passwordValid;
		let formErrors = this.state.formErrors;
		switch (name) {
			case 'username':
				usernameValid = value.length >= 3;
				formErrors.username = usernameValid ? '' : ' is too short';
				break;
			case 'password':
				passwordValid = value.length >= 4;
				formErrors.password = passwordValid ? '' : ' should be at least 4 characters';
				break;
			default:
				break;
		}
		this.setState({
			usernameValid: usernameValid,
			passwordValid: passwordValid
		}, this.validateForm);
	}

	validateForm = () => {
		this.setState({ formValid: this.state.usernameValid && this.state.passwordValid });
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
			console.log("Signup response: " + xhr.responseText);
			console.log("xhr.status: " + xhr.status);
			if (xhr.status === 200) {
				var response = JSON.parse(xhr.responseText);
				var signupSuccess = response.success;
				console.dir(response);
				if (signupSuccess === true) {
					console.log("Signup successful");
					this.setState({
						signUpSuccessful: true
					});
				}
				else {
					console.log("Signup failed");
					if (response.errorResponse.errorField != null && response.errorResponse.errorField == 'Username') {
						this.setState({ usernameUnique: false });
						toast('Username already exists, pick different username');
					}
					else if (response.errorResponse.status != null && response.errorResponse.status == 500) {
						this.setState({ errorInLoginRequest: true });
						toast('Server Error');	
					}
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
			return <Navigate to="/login" />
		}
		return (
			<div>
				<nav className='navbar navbar-expand-lg navbar-light bg-light'>
					<a className='navbar-brand shadow btn btn-secondary btn-lg' href='/login'>Back To Login</a>
				</nav>
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
					<div className='panel panel-default'>
						<FormErrors formErrors={this.state.formErrors} />
					</div>
					<ToastContainer />
					<button className="login-button shadow small" disabled={ !this.state.formValid} onClick={() => this.handleClick()}>
						Create Account
					</button>
				</div>
			</div>
		)
	}
}

export default SignUp;
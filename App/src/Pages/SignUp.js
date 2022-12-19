import React from 'react';
import './SignUp.css';

class SignUp extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			isLoggedIn: false
		};
	}

	handleUsernameChange = (event) => {
		this.setState({ username: event.target.value });
	}

	handleClick() {
		this.setState(state => ({
			isLoggedIn: !state.isLoggedIn
		}));
	}

	render() {
		return (
			<div>
				<div>
					<input className="username-input" type="text" placeholder="Username" value={this.state.username} onChange={this.handleUsernameChange} />
				</div>
				<button className="login-button" onClick={() => this.handleClick()}>
					{this.state.isLoggedIn ? 'Log Out' : 'Log In'}
				</button>
			</div>
		)
	}
}

export default SignUp;
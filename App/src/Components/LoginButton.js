import React from 'react';

class LoginButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = { isLoggedIn: false };
	}

	handleClick() {
		this.setState(state => ({
			isLoggedIn: !state.isLoggedIn
		}));
	}

	render() {
		return (
			<button onClick={() => this.handleClick()}>
				{this.state.isLoggedIn ? 'Log Out' : 'Log In'}
			</button>
		);
	}
}

export default LoginButton;

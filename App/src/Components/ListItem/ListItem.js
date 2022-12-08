import React from 'react';
import './ListItem.css';

class ListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active: false,
		};
	}

	handleClick = () => {
		this.setState((prevState) => ({
			active: !prevState.active,
		}));
	}

	render() {
		const { user } = this.props;
		const { active } = this.state;

		return (
			<li className="user-list-item" onClick={this.handleClick}>
				{user.name}
				{active && <span className="dot">&bull;</span>}
			</li>
		);
	}
}

export default ListItem;
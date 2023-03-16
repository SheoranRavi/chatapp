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
		this.props.setCurrentTarget(this.props.user.userId);
		const listItem = document.getElementById("listItem");
		listItem.classList.toggle("active");
	}

	render() {
		const { user } = this.props;
		const { active } = this.state;
		return (
			<li className="user-list-item" id="listItem" onClick={this.handleClick}>
				{user.name}
			</li>
		);
	}
}

export default ListItem;
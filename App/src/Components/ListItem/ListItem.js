import React from 'react';
import './ListItem.css';

class ListItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active: false,
		};
	}

	handleClick = async () => {
		await this.setState((prevState) => ({
			active: !prevState.active,
		}));
		if(this.state.active === true){
			this.props.setCurrentTarget(this.props.user.userId);
		}
		else{
			this.props.setCurrentTarget(null);
		}
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
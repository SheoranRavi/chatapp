import React from "react";
import ListItem from "../ListItem/ListItem.js";
import "./Sidebar.css";

class Sidebar extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		var setCurrentTarget = this.props.setCurrentTarget;
		const activeUsersList = this.props.activeUsers.map((user, index) => (
			<ListItem key={index} user={user}
				setCurrentTarget={setCurrentTarget} 
				/>
		));

		return (
			<aside className="sidebar">
				<h2 className="sidebar-header">Active Users</h2>
				<ul>
					{activeUsersList}
				</ul>
			</aside>
		);
	}
}

export default Sidebar;

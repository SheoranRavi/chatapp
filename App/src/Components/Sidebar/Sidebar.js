import React from "react";
import ListItem from "../ListItem/ListItem.js";
import "./Sidebar.css";

class Sidebar extends React.Component {
	render() {
		const { activeUsers } = this.props;

		const activeUsersList = activeUsers.map(user => (
			<ListItem key={user.id} user={user} />
		));

		return (
			<aside className="sidebar">
				<h2>Active Users</h2>
				<ul>
					{activeUsersList}
				</ul>
			</aside>
		);
	}
}

export default Sidebar;

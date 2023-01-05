import React from "react";
import ListItem from "../ListItem/ListItem.js";
import "./Sidebar.css";

class Sidebar extends React.Component {
	constructor(props) {
		super(props);
	}
	render() {
		console.log("render called in Sidebar.js");
		const activeUsersList = this.props.activeUsers.map((user, index) => (
			<ListItem key={index} user={user} />
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

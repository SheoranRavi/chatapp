import React from "react";
import "./DialogueBox.css";

class DialogueBox extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		console.log("render called in DialogueBox.js");
		return (
			<div className="dialogue-box">
				<div className="messages-container">
					{/* Map through the messages array and create a div element for each message */}
					{this.props.messages.map((message, index) => {
						return (
							<div className="message" key={index}>
								<div className="message-time">{message.time}</div>
								<div className="message-text">{message.text}</div>
								<div className="sender-name">{message.sender}</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}

export default DialogueBox;
import React from "react";
import "./DialogueBox.css";

class DialogueBox extends React.Component {
	constructor(props) {
		super(props);

		// An array of sample messages
		this.messages = [
			{
				sender: "Jane Doe",
				text: "Hi, how are you?"
			},
			{
				sender: "John Doe",
				text: "I'm doing well, thanks for asking."
			},
			{
				sender: "Jane Doe",
				text: "That's good to hear. Do you want to grab lunch?"
			},
			{
				sender: "John Doe",
				text: "Sure, that sounds like a great idea."
			}
		];
	}

	render() {
		return (
			<div className="dialogue-box">
				<div className="messages-container">
					{/* Map through the messages array and create a div element for each message */}
					{this.messages.map((message, index) => {
						return (
							<div className="message" key={index}>
								<div className="message-text">{message.text}</div>
								<div className="sender-name">{message.sender}</div>
							</div>
						);
					})}
				</div>
				<input type="text" placeholder="Enter your message" />
			</div>
		);
	}
}

export default DialogueBox;
import React from "react";
import "./DialogueBox.css";

class DialogueBox extends React.Component {
	constructor(props) {
		super(props);
		this.messageEndRef = React.createRef();
	}

	scrollToBottom = () => {
		this.messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
	}

	componentDidMount() {
		this.scrollToBottom();
	}

	componentDidUpdate() {
		this.scrollToBottom();
	}

	videoCall = () => {
		console.log("Video call");
		this.props.videoCallCallback(this.props.userId);
	}

	render() {
		const messageBase = "message"
		const receivedMessage = messageBase + " received-message";
		const sentMessage = messageBase + " sent-message";
		return (
			<div className="dialogue-box">
				<button className="btn btn-primary shadow-sm video-call-button bg-blue rounded" onClick={this.videoCall}>
					<div className="fa fa-video-camera"></div>
				</button>
					{this.props.messages.map((message, index) => {
						// If the message is from the current user, add the 'messageThis' class to the message div
						message.className = message.userId == this.props.userId ? sentMessage : receivedMessage;
						return (
							<div className={ message.className} key={index}>
								<div className="sender-name">{message.sender}</div>
								<div className="message-text">{message.text}</div>
								<div className="message-time">{message.time}</div>
							</div>
						);
					})}
				<div ref={this.messageEndRef} />
			</div>
		);
	}
}

export default DialogueBox;

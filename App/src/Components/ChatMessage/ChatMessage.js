import React from 'react';

class ChatMessage extends React.Component {
	render() {
		const { message } = this.props;
		return (
			<div className="chat-message">
				<div className="chat-message-sender">{message.sender}</div>
				<div className="chat-message-text">{message.text}</div>
			</div>
		);
	}
}
import React from 'react';
import './ChatInput.css';

class ChatInput extends React.Component {
	render() {
		const { onSubmit } = this.props;
		return (
			<form id='messageForm' onSubmit={onSubmit} className="chat-input">
				Message: <input className="input-box" type="text" placeholder="Type your message here..." />
				<button className="message-button" type="submit">Send</button>
			</form>
		);
	}
}

export default ChatInput;
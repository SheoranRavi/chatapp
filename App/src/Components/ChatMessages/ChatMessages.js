import React from 'react';
import ChatMessage from '../ChatMessage/ChatMessage';
import './ChatMessages.css';

class ChatMessages extends React.Component {
	render() {
		const { messages } = this.props;
		return (
			<div className="chat-messages">
				{messages.map(message => (
					<ChatMessage key={message.id} message={message} />
				))}
			</div>
		);
	}
}

export default ChatMessages;
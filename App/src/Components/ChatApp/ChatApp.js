import React from 'react';
import ChatHeader from '../ChatHeader/ChatHeader';
import ChatMessages from '../ChatMessages/ChatMessages';
import ChatInput from '../ChatInput/ChatInput';
import Sidebar from '../Sidebar/Sidebar';
import './ChatApp.css';

class ChatApp extends React.Component {
	state = {
		messages: [],
	};

	handleSubmit = event => {
		event.preventDefault();
		// Get the message text from the input field
		const input = event.target.elements[0];
		const text = input.value;

		// Clear the input field
		input.value = '';

		// Add the message to the array of messages
		this.setState(prevState => ({
			messages: [...prevState.messages, { id: Date.now(), text, sender: 'Me' }],
		}));
	};

	render() {
		const users = [
			{ id: 1, name: 'Ravi' },
			{ id: 2, name: 'Nalisha' },
			{ id: 3, name: 'Vishal' },
		];
		return (
			<div className="chat-app">
				<ChatHeader />
				<Sidebar activeUsers={users} />
				<ChatMessages messages={this.state.messages} />
				<ChatInput onSubmit={this.handleSubmit} />
			</div>
		);
	}
}

export default ChatApp;
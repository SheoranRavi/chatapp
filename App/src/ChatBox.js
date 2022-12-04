import React from 'react';

const ChatDialogue = (props) => {
  return (
    <div className="chat-dialogue">
      {props.messages.map((message) => (
        <div className="chat-message" key={message.id}>
          <p className="message-text">{message.text}</p>
        </div>
      ))}
    </div>
  );
}

export default ChatDialogue;

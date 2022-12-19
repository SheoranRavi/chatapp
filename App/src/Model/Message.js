class Message{
	reaction = null;
	
	constructor(sender, text) {
		this.sender = sender;
		this.text = text;
		this.time = new Date();
	}

	reactTo(reaction) {
		this.reaction = reaction;
	}
}

export default Message;
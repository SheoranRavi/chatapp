var connection = null;
var clientId = 0;

function setUsername() {
	console.log("***SET USERNAME");
	var msg = {
		name: document.getElementById("name").value,
		date: Date.now(),
		id: clientId,
		type: "username"
	};
	console.log("Sending username to server: " + console.dir(msg));
	connection.send(JSON.stringify(msg));
}

function connect() {
	document.getElementById('loginbtn').disabled = true;
	var serverUrl;
	var scheme = "ws";

	if (document.location.protocol === "https:") {
		scheme += "s";
	}

	serverUrl = scheme + "://" + document.location.hostname + ":" + document.location.port;

	connection = new WebSocket(serverUrl, "json");
	console.log("***CREATED WEBSOCKET");

	connection.onopen = function (evt) {
		console.log("***ONOPEN");
		document.getElementById("text").disabled = false;
		document.getElementById("send").disabled = false;
	};
	console.log("***CREATED ONOPEN");

	connection.onmessage = function (evt) {
		console.log("***ONMESSAGE");
		var f = document.getElementById("messageBox").contentDocument;
		var text = "";
		var msg = JSON.parse(evt.data);
		console.log("Message received: ");
		console.dir(msg);
		var time = new Date(msg.date);
		var timeStr = time.toLocaleTimeString();

		switch (msg.type) {
			case "id":
				clientId = msg.Id;
				setUsername();
				break;
			case "username":
				text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
				break;
			case "message":
				text = "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.text + "<br>";
				break;
			case "rejectusername":
				text = "<b>Your username has been set to <em>" + msg.name + "</em> because the name you chose is in use.</b><br>";
				break;
			case "userList":
				var i;
				var listBox = document.getElementById("userlistbox");
				listBox.innerHTML = '';
				const att = document.createAttribute("class");
				att.value = "list-group-item";
				for (i = 0; i < msg.users.length; ++i) {
					var ul = document.createElement("li");
					var textNode = document.createTextNode(msg.users[i]);
					ul.setAttributeNode(att.cloneNode());
					ul.appendChild(textNode);
					listBox.appendChild(ul);
				}
				break;
		}

		if (text.length) {
			f.write(text);
			document.getElementById("messageBox").contentWindow.scrollBy(0,100);
		}
	};
	console.log("***CREATED ONMESSAGE");
}

function send() {
	console.log("***SEND");
	var msg = {
		text: document.getElementById("text").value,
		type: "message",
		id: clientId,
		date: Date.now()
	};
	connection.send(JSON.stringify(msg));
	document.getElementById("text").value = "";
}

function handleKey(evt) {
	if (evt.keyCode === 13 || evt.keyCode === 14) {
		if (!document.getElementById("send").disabled && document.getElementById("text").value != "") {
			send();
		}
		else if (connection === null && document.getElementById("name").value != "") {
			connect();
		}
	}
}

module.exports = {
	handleKey: handleKey,
	connect: connect,
	send: send,
	setUsername: setUsername,
	connection: connection,
	clientId: clientId
}

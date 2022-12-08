import React from 'react';
import LoginButton from './Components/LoginButton';
import TickingClock from './Components/TickingClock';
import Input from './Components/Input';
import ChatApp from './Components/ChatApp/ChatApp';


// function App that renders a login button and a ticking clock
function App() {
	return (
		<div>
			<LoginButton />
			<TickingClock />
			<Input />
			<ChatApp />
		</div>
	);
}

//default export
export default App;
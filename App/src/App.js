import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TickingClock from './Components/TickingClock.js';
import ChatApp from './Components/ChatApp/ChatApp.js';
import SignUp from './Pages/SignUp.js';
import Login from './Pages/Login.js';


// function App that renders a login button and a ticking clock
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Login />} />
				<Route path="signup" element={<SignUp />} />
				<Route path="chat" element={<ChatApp />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
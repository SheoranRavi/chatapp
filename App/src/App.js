import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TickingClock from './Components/TickingClock';
import ChatApp from './Components/ChatApp/ChatApp';
import SignUp from './Pages/SignUp';


// function App that renders a login button and a ticking clock
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<SignUp />} />
				<Route path="/chat" element={<ChatApp connection={null} />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
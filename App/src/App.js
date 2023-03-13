import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TickingClock from './Components/TickingClock.js';
import Home from './Pages/Home.js';
import SignUp from './Pages/SignUp.js';
import Login from './Pages/Login.js';


// function App that renders a login button and a ticking clock
function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/" element={<Home />} /> 
				<Route path="signup" element={<SignUp />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
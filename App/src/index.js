import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// get element by Id root
const root = ReactDOM.createRoot(document.getElementById("root"));
console.log(root);
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
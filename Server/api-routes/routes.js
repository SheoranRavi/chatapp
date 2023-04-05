import { ChatAppController } from '../controllers/ChatAppController.js';

export class Routes{
	constructor() {
	}

	defineRoutes(app, chatAppController) {
		app.post('/login', chatAppController.login);
		app.post('/signup', chatAppController.signup);
		app.get('/', chatAppController.getRoot);
		app.get('/login', chatAppController.getRoot);
		app.get('/signup', chatAppController.getRoot);
		app.get('/getWSToken', chatAppController.getWSToken);
		app.get('/myfavicon.ico', chatAppController.getFavicon);
	}	
}
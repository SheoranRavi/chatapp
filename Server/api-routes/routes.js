import { ChatAppController } from '../controllers/ChatAppController.js';

export class Routes{
	constructor() {
	}

	defineRoutes(app, chatAppController) {
		app.post('/login', chatAppController.login);
		app.post('/signup', chatAppController.signup);
		app.get('/', chatAppController.getRoot);
	}	
}
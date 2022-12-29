import { ChatAppController } from '../controllers/ChatAppController';

export class Routes{
	constructor(app) {
		this.controller = new ChatAppController();
	}

	defineRoutes(app) {
		app.post('/login', this.controller.login);
		app.get('/', this.controller.getRoot);
	}	
}

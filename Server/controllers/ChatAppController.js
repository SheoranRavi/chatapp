const path = require('path');
import staticDir from '../Model/Constants';
import { loginResponse } from '../Model/loginResponse';
import { User } from '../Model/User';
import { UsersRepository } from '../repository/UsersRepository';

export class ChatAppController{
	constructor() {
		this.usersRepository = new UsersRepository();
	}
	
	login(req, res) {
		const username = req.body.username;
		console.log('login called with username ' + username + ' and password ' + password);
		const user = new User(null, req.body.username);
		const success = this.usersRepository.addUser(user);
		const response = new loginResponse(success, null, user);
		res.send(response);
	}
	
	getRoot(req, res) {
		const INDEX = '/public/index.html';
		const indexPath = path.resolve(path.join(staticDir, INDEX));
		res.sendFile(indexPath);
	}
}
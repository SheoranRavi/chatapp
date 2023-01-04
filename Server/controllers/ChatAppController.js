import path from 'path';
import { staticDir } from '../Model/Constants.js';
import { loginResponse } from '../Model/loginResponse.js';
import { User } from '../Model/User.js';
import { UsersRepository } from '../repository/UsersRepository.js';
import express from 'express';

export class ChatAppController{
	constructor() {
		this.usersRepository = new UsersRepository();
		this.login = this.login.bind(this);
		this.getRoot = this.getRoot.bind(this);
	}
	
	login(req, res) {
		try {
			console.log('login request: ' + req);
			console.log('login request body: ' + req.body);
			const username = req.body.username;
			console.log('login called with username ' + username);
			const user = new User(null, req.body.username);
			const success = this.usersRepository.addUser(user);
			const response = new loginResponse(success, null, user);
			console.log('login response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			console.log('error in login: ' + e);
			const response = new loginResponse(false, e, null);
			res.json(response);
		}
	}
	
	getRoot(req, res) {
		const INDEX = '/public/index.html';
		const indexPath = path.resolve(path.join(staticDir, INDEX));
		res.sendFile(indexPath);
	}
}
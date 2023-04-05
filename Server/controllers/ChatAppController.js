import path from 'path';
import { staticDir } from '../Model/Constants.js';
import { LoginResponse, LoginResponseToken } from '../Model/LoginResponse.js';
import { SignupResponse } from '../Model/SignUpResponse.js';
import log4js from 'log4js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

export class ChatAppController{
	constructor(chatAppService, authenticationService) {
		this.logger = log4js.getLogger('controller');
		this.chatAppService = chatAppService;
		this.authenticationService = authenticationService;
		this.login = this.login.bind(this);
		this.getRoot = this.getRoot.bind(this);
		this.signup = this.signup.bind(this);
		this.getWSToken = this.getWSToken.bind(this);
	}
	
	async login(req, res) {
		try {
			const username = req.body.username;
			const password = req.body.password;
			this.logger.info('login called with username ' + username);
			
			var authResponse = await this.authenticationService.authenticateUser(username, password);
			const response = new LoginResponseToken(authResponse.success, 
				authResponse.errorResponse, authResponse.token);
			console.log('login response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			let errorResponse = { status: 500, message: 'Server error' };
			console.log('error in login: ' + e);
			this.logger.error('error in login: ' + e.stack);
			const response = new LoginResponse(false, errorResponse, null);
			res.json(response);
		}
	}

	async signup(req, res) {
		try {
			const username = req.body.username;
			this.logger.info('signup called with username ' + username);
			var response = await this.authenticationService.signupUser(req.body.username, req.body.password);
			
			console.log('signup response: ' + JSON.stringify(response));
			this.logger.info('signup response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			let errorResponse = { status: 500, message: 'Server error' };
			this.logger.error('error in signup: ' + e.stack);
			const response = new SignupResponse(false, errorResponse);
			res.json(response);
		}
	}
	
	getRoot(req, res) {
		const INDEX = '/public/index.html';
		const indexPath = path.resolve(path.join(staticDir, INDEX));
		res.sendFile(indexPath);
	}

	async getWSToken(req, res){
		try{
			const token = req.headers.authorization.split(' ')[1];
			var wsToken = await this.authenticationService.getWSToken(token);
			res.status(200).json({success: true, wsToken: wsToken});
		}
		catch(e){
			console.log('error in getWSToken: ' + e);
			this.logger.error('error in getWSToken: ' + e.stack);
			res.status(401).json({success: false, wsToken: ""});
		}
	}

	async getFavicon(req, res){
		const INDEX = '/public/myfavicon.ico';
		const iconPath = path.resolve(path.join(staticDir, INDEX));
		res.sendFile(iconPath);
	}
}
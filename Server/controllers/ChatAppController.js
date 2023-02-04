import path from 'path';
import { staticDir } from '../Model/Constants.js';
import { loginResponse } from '../Model/loginResponse.js';
import { SignupResponse } from '../Model/SignUpResponse.js';
import { User } from '../Model/User.js';
import bcrypt from 'bcrypt';
import log4js from 'log4js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

export class ChatAppController{
	saltRounds = 10;
	constructor(usersRepository, chatAppService) {
		this.__dirname = dirname(fileURLToPath(import.meta.url));
		let configPath = path.join(this.__dirname, '../log4js.json');
		log4js.configure(configPath);
		this.logger = log4js.getLogger('controller');
		this.usersRepository = usersRepository;
		this.chatAppService = chatAppService;
		this.login = this.login.bind(this);
		this.getRoot = this.getRoot.bind(this);
		this.signup = this.signup.bind(this);
	}
	
	async login(req, res) {
		try {
			const username = req.body.username;
			this.logger.info('login called with username ' + username);
			
			const user = new User(null, req.body.username.toLowerCase(), req.body.password);

			var errorResponse = {};
			const success = await this.usersRepository.checkUser(user, errorResponse);
			var respUser = new User(null, user.username, null);
			if (success)
				respUser.id = user.id;
			const response = new loginResponse(success, errorResponse, respUser);
			console.log('login response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			errorResponse = { status: 500, message: 'Server error' };
			console.log('error in login: ' + e);
			this.logger.error('error in login: ' + e.stack);
			const response = new loginResponse(false, errorResponse, null);
			res.json(response);
		}
	}

	async signup(req, res) {
		try {
			const username = req.body.username;
			this.logger.info('signup called with username ' + username);
			const user = new User(null, req.body.username.toLowerCase(), null);
			await bcrypt.hash(req.body.password, this.saltRounds)
				.then((hash) => { user.password = hash })
				.catch(ex => {
					this.logger.error('error in bcrypt: ' + ex.stack);
				});
			var errorResponse = {};
			const success = this.usersRepository.addUser(user, errorResponse);
			const response = new SignupResponse(success, errorResponse);
			console.log('signup response: ' + JSON.stringify(response));
			this.logger.info('signup response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			errorResponse = { status: 500, message: 'Server error' };
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
}
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
	
	login(req, res) {
		try {
			const username = req.body.username;
			this.logger.info('login called with username ' + username);
			
			const user = new User(null, req.body.username, null);

			bcrypt.hash(req.body.password, this.saltRounds)
				.then((hash) => { user.password = hash })
				.catch(ex => {
					this.logger.error('error in bcrypt: ' + ex.stack);
				});
			
			const success = this.usersRepository.checkUser(user);
			var respUser = new User(null, user.username, null);
			if (success)
				respUser.id = user.id;
			const response = new loginResponse(success, null, respUser);
			console.log('login response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			console.log('error in login: ' + e);
			this.logger.error('error in login: ' + e.stack);
			const response = new loginResponse(false, e, null);
			res.json(response);
		}
	}

	signup(req, res) {
		try {
			const username = req.body.username;
			this.logger.info('signup called with username ' + username);
			const user = new User(null, req.body.username, null);
			bcrypt.hash(req.body.password, this.saltRounds)
				.then((hash) => { user.password = hash })
				.catch(ex => {
					this.logger.error('error in bcrypt: ' + ex.stack);
				});
			const success = this.usersRepository.addUser(user);
			const response = new SignupResponse(success, null);
			console.log('signup response: ' + JSON.stringify(response));
			this.logger.info('signup response: ' + JSON.stringify(response));
			res.json(response);
		}
		catch (e) {
			this.logger.error('error in signup: ' + e.stack);
			const response = new SignupResponse(false, null);
			res.json(response);
		}
	}
	
	getRoot(req, res) {
		const INDEX = '/public/index.html';
		const indexPath = path.resolve(path.join(staticDir, INDEX));
		res.sendFile(indexPath);
	}
}
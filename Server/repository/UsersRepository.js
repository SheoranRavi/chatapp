import { User } from '../Model/User.js';

export class UsersRepository {
	constructor() {
		this.users = [];
		this.nextId = Date.now();
	}

	addUser(user) {
		for (let i = 0; i < this.users.length; ++i){
			if (this.users[i].username === user.username) {
				return false;
			}
		}
		user.id = this.nextId;
		this.nextId++;
		this.users.push(user);
		return true;
	}

	getUser(username) {
		return this.users.find(user => user.username === username);
	}

	getAllUsers() {
		return this.users;
	}
}
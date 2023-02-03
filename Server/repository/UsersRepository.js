import { User } from '../Model/User.js';
import bcrypt from 'bcrypt';

export class UsersRepository {
	constructor() {
		this.users = [];
		this.nextId = Date.now();
	}

	addUser(user) {
		for (let i = 0; i < this.users.length; ++i){
			if (this.users[i].username == user.username) {
				return false;
			}
		}
		user.id = this.nextId;
		this.nextId++;
		this.users.push(user);
		return true;
	}

	getUser(username) {
		return this.users.find(user => user.username == username);
	}

	getUser(userId) {
		return this.users.find(user => user.id == userId);
	}

	getAllUsers() {
		return this.users;
	}

	deleteUser(userId) {
		for (let i = 0; i < this.users.length; ++i){
			if (this.users[i].id == userId) {
				this.users.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	checkUser(user) {
		for (let i = 0; i < this.users.length; ++i){
			if (this.users[i].username == user.username) {
				var res = bcrypt.compare(this.users[i].password, user.password)
					.then(res => {
						return res;
					});
				if(res)
					user.id = this.users[i].id;
				return res;
			}
		}
		return false;
	}
}
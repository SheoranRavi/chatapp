import { User } from '../Model/User.js';
import bcrypt from 'bcrypt';

export class UsersRepositoryInMemory {
	constructor() {
		this.users = [];
		this.nextId = Date.now();
	}

	addUser(user, errorResponse) {
		for (let i = 0; i < this.users.length; ++i){
			if (this.users[i].username == user.username) {
				errorResponse.errorField = 'Username';
				errorResponse.message = 'Username already exists';
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

    init(){
        return true;
    }

	async loginUser(user, errorResponse) {
		var res = false;
		try {
			for (let i = 0; i < this.users.length; ++i) {
				if (this.users[i].username == user.username) {
					await bcrypt.compare(user.password, this.users[i].password)
						.then(success => {
							console.log('result of bcrypt compare:', success);
							res = success;
							return;
						})
						.catch(err => {
							console.log('error comparing passwords: ', err);
							errorResponse.status = 500;
							errorResponse.message = 'Internal server error';
							return false;
						});
					if (res)
						user.id = this.users[i].id;
					else {
						errorResponse.errorField = 'Password';
						errorResponse.message = 'Password is incorrect';
						errorResponse.status = 400;
					}
					return res;
				}
			}
			errorResponse.errorField = 'Username';
			errorResponse.message = 'Username does not exist';
			return false;
		}
		catch (err) {
			console.log('error checking user: ', err);
			errorResponse.status = 500;
			errorResponse.message = 'Internal server error';
			return false;
		}
	}
}
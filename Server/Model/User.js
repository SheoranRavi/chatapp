// id: int
// username: string
// password: string

export class User{
	constructor(id, username, password){
		this.id = id;
		this.username = username;
		this.password = password;
	}
}

export class UserResponse{
	constructor(id, username){
		this.id = id;
		this.username = username;
	}
}
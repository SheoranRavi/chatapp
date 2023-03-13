export class LoginResponse{
	constructor(success, errorResponse, user){
		this.success = success;
		this.errorResponse = errorResponse;
		this.user = user;
	}
}

export class LoginResponseToken{
	constructor(success, errorResponse, token){
		this.success = success;
		this.errorResponse = errorResponse;
		this.token = token;
	}
}
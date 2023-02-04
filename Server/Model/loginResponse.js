export class loginResponse{
	constructor(success, errorResponse, user){
		this.success = success;
		this.errorResponse = errorResponse;
		this.user = user;
	}
}
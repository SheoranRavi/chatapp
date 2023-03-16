import { User, UserResponse } from '../Model/User.js';
import bcrypt from 'bcrypt';
import { SignupResponse } from '../Model/SignUpResponse.js';
import jwt from 'jsonwebtoken';
import log4js from 'log4js';

export class AuthenticationService{
    saltRounds = 10;
	wsTokenExpiryInSeconds = 60;
	httpTokenExpiryInSeconds = 60*60;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
        this.logger = log4js.getLogger('authenticationService');
    }

    async authenticateUser(username, password) {
        const user = new User(null, username.toLowerCase(), password);

        var errorResponse = {};
        const success = await this.usersRepository.checkUser(user, errorResponse);
        console.log('success from repo: ', success);
        var respUser = new UserResponse(null, user.username);
        var token = "";
        if (success){
            respUser.id = user.id;
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let payload = {
                id: respUser.id,
                username: respUser.username
            }
            token = jwt.sign(payload, jwtSecretKey, {expiresIn: this.httpTokenExpiryInSeconds});
        }
        var response = {
            success: success,
            errorResponse: errorResponse,
            token: token
        };
        return response;
    }

    async signupUser(username, password){
        const user = new User(null, username.toLowerCase(), null);
        await bcrypt.hash(password, this.saltRounds)
            .then((hash) => { user.password = hash })
            .catch(ex => {
                this.logger.error('error in bcrypt: ' + ex.stack);
            });
        var errorResponse = {};
        const success = this.usersRepository.addUser(user, errorResponse);
        const response = new SignupResponse(success, errorResponse);
        return response;
    }

    async getWSToken(httpToken) {
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const payload = jwt.verify(httpToken, jwtSecretKey);
        var wsPayload = {
            id: payload.id
        };
        const wsJwtSecretKey = process.env.WS_TOKEN_SECRET_KEY;
        var wsToken = jwt.sign(wsPayload, wsJwtSecretKey, {expiresIn:this.wsTokenExpiryInSeconds});
        return wsToken;
    }

    async verifyWsToken(wsToken){
        try {
            console.log('wsToken: ' + wsToken);
            const wsJwtSecretKey = process.env.WS_TOKEN_SECRET_KEY;
            const payload = jwt.verify(wsToken, wsJwtSecretKey);
            return true;
        }
        catch(e){
            this.logger.error('error in verifyWsToken: ' + e.stack);
            console.log('error in verifyWsToken: ' + e.stack);
            return false;
        }
    }
}
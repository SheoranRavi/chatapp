import * as mysql from "mysql2";
import bcrypt from "bcrypt";
import log4js from "log4js";
import * as uuid from "uuid";

export class UsersRepository {
	pool = null;
	usersColumns = null;
	
	constructor() {
		let username = process.env.MYSQL_USERNAME;
		let password = process.env.MYSQL_PASSWORD;
		this.database = process.env.DATABASE;
		this.pool = mysql.createPool({
			host: "localhost",
			user: username,
			password: password,
			database: this.database,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			multipleStatements: true,
			debug: false,
			connectTimeout: 10000,
			idleTimeout: 60000,
		});
		this.promisePool = this.pool.promise();
		this.usersColumns = {
			ID: "ID",
			UserId: "UserId",
			Username: "Username",
			HashedPassword: "HashedPassword",
		};
		this.logger = log4js.getLogger("UsersRepository");
	}

	async testConnection(){
		try{
			let sql = 'SELECT 1 + 1 AS solution';
			const [rows, fields] = await this.promisePool.execute(sql);
			if(rows && rows.length > 0){
				return true;
			}
			return false;
		}catch(err){
			console.log('error in testConnection: ', err);
			return false;
		}
	}

	init() {
		this.createDatabaseIfNotExists();
		this.createTableIFNotExists();
		return true;
	}

	createDatabaseIfNotExists() {
		this.pool.query(
			"CREATE DATABASE IF NOT EXISTS " + this.database,
			(error, results, fields) => {
				if (error) {
					console.log("error in createDatabaseIfNotExists: ", error);
					this.logger.error(
						"error in createDatabaseIfNotExists: ",
						error
					);
				}
			}
		);
	}

	async createTableIFNotExists() {
		const sql = `CREATE TABLE IF NOT EXISTS Users (
            ${this.usersColumns.ID} BIGINT NOT NULL AUTO_INCREMENT,
            ${this.usersColumns.UserId} VARCHAR(36) NOT NULL,
            ${this.usersColumns.Username} VARCHAR(255) NOT NULL,
            ${this.usersColumns.HashedPassword} VARCHAR(255) NOT NULL,
            PRIMARY KEY (${this.usersColumns.ID}),
            UNIQUE KEY (${this.usersColumns.UserId})
        );`;
		this.pool.query(sql, (error, results, fields) => {
			if (error) {
				console.log("error in createTableIFNotExists: ", error);
				this.logger.error("error in createTableIFNotExists: ", error);
			}
		});
	}

	async addUser(user, errorResponse) {
		var success = false;
		// check if user already exists by checking username
		try {
			let sql = `SELECT * FROM Users WHERE Username = ?`;
			const [rows, fields] = await this.promisePool.execute(sql, [
				`${user.username}`,
			]);
			if (rows && rows.length > 0) {
				errorResponse.errorField = "Username";
				errorResponse.message = "Username already exists";
				return false;
			}
			console.log("user is not already present");
			user.id = uuid.v4();
			sql = `INSERT INTO Users (UserId, Username, HashedPassword) VALUES 
            (?,?,?);`;
			const params = [
				`${user.id}`,
				`${user.username}`,
				`${user.password}`,
			];
			await this.promisePool.execute(sql, params);
			success = true;
		} catch (err) {
			console.log("error in addUser: ", err);
		}
		return success;
	}

	async getUser(username) {
		let sql = `SELECT * FROM Users WHERE Username = ?`;
		const params = [`${username}`];
		var user = null;
		try {
			const [rows, fields] = await this.promisePool.execute(sql, params);
			if (rows && rows.length > 0) {
				user = rows[0];
			}
		} catch (err) {
			console.log("error in getUser: ", err);
		}
		return user;
	}

	async getUser(userId) {
		let sql = `SELECT * FROM Users WHERE Username = ?`;
		const params = [`${userId}`];
		var user = null;
		try {
			const [rows, fields] = await this.promisePool.execute(sql, params);
			if (rows && rows.length > 0) {
				user = rows[0];
			}
		} catch (err) {
			console.log("error in getUser: ", err);
		}
		return user;
	}

	async comparePassword(password, hash) {
		return await bcrypt.compare(password, hash);
	}

	async deleteUser(userId) {
		let sql = `DELETE FROM Users WHERE UserId = ?`;
		const params = [`${userId}`];
		var success = false;
		try{
			const [rows, fields] = await this.promisePool.execute(sql, params);
			success = true;
		}
		catch(err){
			console.log("error in deleteUser: ", err);
		}
		return success;
	}

	async loginUser(user, errorResponse) {
		let sql = `SELECT * FROM Users WHERE Username = ?`;
		var success = false;
		try {
			const [rows, fields] = await this.promisePool.execute(sql, [`${user.username}`]);
			if (rows && rows.length > 0) {
				let localUser = rows[0];
				if (await this.comparePassword(user.password, localUser.HashedPassword)) {
					success = true;
					user.id = localUser.UserId;
				} else {
					errorResponse.errorField = "Password";
					errorResponse.message = "Password is incorrect";
					errorResponse.status = 400;
				}
			} else {
				errorResponse.errorField = "Username";
				errorResponse.message = "Username does not exist";
			}
		} catch (err) {
			this.logger.error("error in loginUser: ", error);
			errorResponse.status = 500;
			errorResponse.message = "Internal server error";
		}
		return success;
	}
}

function Log(msg) {
	console.log((new Date()).toISOString() + " " + msg);
}

module.exports = {
	Log: Log
};
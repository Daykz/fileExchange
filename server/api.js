const api = () => {
const app = require('express')();
	app.get('/download', (req, res, next) => {
			return console.log('download');
		});
	return app;
}


module.exports = api;
const fs 		= require("fs");
const parseArgv	= require('./parsing');
const request	= require('./request');
const { upload, download } = require('./request');

const object = {};
const argv = process.argv.forEach((value, key) => {
	const params = value.split('=');

	object[params[0]] = params[1];
	return ;
});

parseArgv(object);

(object.op == 'upload') ? upload(object) : download(object);
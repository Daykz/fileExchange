const fs 		= require("fs");
const parsing	= require('./parsing');
const path = require('path');
const { upload, download } = require('./request');


let options = '';
const meta = ['--meta', '-m'];
const compress = ['--compress', '-c'];
	const object = {};

const argv = process.argv.slice(2).forEach((value, key) => {
 
	
	const params = value.split('=');
     // const [ key, value ] = split();
	
	if (meta.indexOf(value) !== -1)
		options = (options) ? options.concat(',m') : options.concat('m');
	else if (compress.indexOf(value) !== -1)
		options = (options) ? options.concat(',c') : options.concat('c');

	object[params[0]] = params[1];
     // object[key] = value;
	return ;
});

parsing(object).then(() => {
	if (object.op == 'upload')
	  upload(object, options).then(console.log).catch(console.log);
	else
		download(object).then(console.log).catch(console.log);
})
.catch(console.error);


const fs 		= require("fs");
const parsing	= require('./parsing');
const path = require('path');
const { upload, download } = require('./request');

const object = {};

// const argv = process.argv.slice(2) --> tu slice() les 2 premières valeurs [ 'node', 'bin.js' ]
// du coup ton argv commence directement au niveau de tes arguments

const argv = process.argv.forEach((value, key) => {
     // const object = {}
	
	const params = value.split('=');
     // const [ key, value ] = split();
	
	object[params[0]] = params[1];
     // object[key] = value;
	return ;
});

parsing(object).then(() => {
	if (object.op == 'upload')
	 upload(object).then(console.log).catch(console.log);
	else
		download(object).then(console.log).catch(console.log);
})
.catch(console.log());
// console.error() pour le catch ! 

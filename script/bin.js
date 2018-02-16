const fs 		= require("fs");
const parsing	= require('./parsing');
const path = require('path');
const { upload, download } = require('./request');


const meta = ['--meta', '-m'];
const compress = ['--compress', '-c'];
const params = ['src', 'dest', 'op', 'id'];
const object = {};

const argv = process.argv.slice(2).forEach((value, key) => {

  const [ id, val ] = value.split('=');
	
	if (params.indexOf(id) > -1) object[id] = val;
	if (meta.indexOf(id) > -1) object['m'] = true;
	if (compress.indexOf(id) > -1) object['c'] = true;
	return ;
});
console.log(object);
parsing(object).then(() => {
	if (object.op == 'upload')
	  upload(object).then(console.log).catch(console.log);
	else
		download(object).then(console.log).catch(console.log);
})
.catch(console.error);


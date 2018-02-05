const fs 		= require("fs");
const parsing	= require('./parsing');
const request	= require('./request');
const { upload, download } = require('./request');

const argv = process.argv;

if (parsing(argv) == 1)
	upload(argv[2], argv[3]);
else if (parsing(argv) == 2)
	download(argv[2], argv[3]);
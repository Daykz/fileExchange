const rp = require('request-promise');
const request = require('request');
const fs 	  = require("fs");
const path = require('path');

const upload = ({src, dest, id}, options) => new Promise((resolve, reject) => {

	const formData= {
		id: id,
		dest: dest,
		options: options,
		file: fs.createReadStream(src),
	};

	request.post({url:'http://127.0.0.1:5000/upload', formData: formData});
});

const download = ({src, dest}) => new Promise((resolve, reject) => {
	request.get('http://127.0.0.1:5000/download', {
		qs: {
			path: src
		}
	}, (err, res, body) => {
		if (err || res.statusCode == 403)
			reject("You can't download the file.");
		else
			resolve('You have download the file.');
	})
	.pipe(fs.createWriteStream(path.resolve(dest)));
});

module.exports = { upload, download }

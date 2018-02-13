const rp = require('request-promise');
const request = require('request');
const fs 	  = require("fs");
const path = require('path');

// promise ????????????????????????????????????
const upload = ({src, dest}) => {
	const options = {
		method: 'POST',
		uri: 'http://127.0.0.1:5000/upload',
		formData: {
			path: dest,
			filename: '',
			file: {
				value: fs.createReadStream(src),
				options: {
				}
			}
		}
	};
	rp(options)
	.then(res => console.log(res))
	.catch(err => console.log('err: ', err));
}

// promise ????????????????????????????????????
const download = ({src, dest}) => {
	request.get('http://127.0.0.1:5000/download', {
		qs: {
			path: src
		}
	}, (err, res, body) => {
		if (res.statusCode == 403)
		 console.log(body);
		else {
			console.log('You have download the file.');
			process.exit(1);
		}
	})
	.pipe(fs.createWriteStream(path.resolve(dest)));
}

module.exports = { upload, download }

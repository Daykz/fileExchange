const rp = require('request-promise');
const fs 	  = require("fs");

const upload = (src, dest) => {
	const options = {
		method: 'POST',
		uri: 'http://127.0.0.1:5000/upload',
		formData: {
			file: {
				value: fs.createReadStream(src),
				options: {
					filename: dest,
					contentType: 'image/jpg'
				}
			}
		}
	};
	rp(options)
	.then(res => console.log('success'))
	.catch(err => console.log('err: ', err));
}

const download = (src, dest) => {
}

module.exports = { upload, download }
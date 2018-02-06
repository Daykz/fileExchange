const rp = require('request-promise');
const fs 	  = require("fs");

const upload = ({src, dest}) => {
	console.log('src = ', src, 'dest = ', dest);
	const options = {
		method: 'POST',
		uri: 'http://127.0.0.1:5000/upload',
		formData: {
			path: dest,
			file: {
				value: fs.createReadStream(src),
				options: {
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
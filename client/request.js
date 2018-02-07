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
	.then(res => console.log(res))
	.catch(err => console.log('err: ', err));
}

const download = ({src, dest}) => {
	console.log('src = ', src, 'dest = ', dest);
	rp.get('http://127.0.0.1:5000/download', {
		qs: {
			path: src
		}
	})
	.then(res => console.log(res))
	.catch(err => console.log('errr'));
}

module.exports = { upload, download }
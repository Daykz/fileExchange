const rp = require('request-promise');
const fs 	  = require("fs");

const upload = (src, dest) => {
	rp.post('http://localhost:5000/upload', {
		file: fs.createReadStream(src),
		fileName: dest
	})
	.then(res => console.log(res))
	.catch(err => console.log(err));
}

const download = (src, dest) => {
}

module.exports = { upload, download }
const rp = require('request-promise');
const request = require('request');
const fs 	  = require("fs");
const path = require('path');

const upload = (object) => new Promise((resolve, reject) => {

	// const conf = {
	// 	method: 'POST',
	// 	uri: `http://127.0.0.1:5000/upload?id=${id}`,
	// 	formData: {
	// 		filename: dest,
	// 		file: {
	// 			value: fs.createReadStream(src),
	// 			options: {
	// 			}
	// 		}
	// 	}
	// };
	// request(conf, err => console.log(err));

	if (object.m) {
		const stats = fs.statSync(object.src, (err, stats) => {
			if (err)
				console.log("Can't get stat on this file");
		})
		const compress = (object.c) ? true : false;
		const date = new Date().toLocaleString();
		const metadata = `- name : ${object.dest}\n- compress : ${compress}\n- size : ${stats.size}\n- source : ${object.src}\n- date : ${date}`;
		console.log(metadata);
	}


	const formData = {
		id: object.id,
		filename: object.dest,
		file: fs.createReadStream(object.src),
	};

	request.post({ url:`http://127.0.0.1:5000/upload?id=${object.id}`, formData: formData }, (err, http, body) => {
		if (err) console.log(err);

		resolve("You have upload the file.");
	});
	
});

const download = ({ src, dest }) => new Promise((resolve, reject) => {
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

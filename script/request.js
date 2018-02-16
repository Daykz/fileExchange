const rp = require('request-promise');
const request = require('request');
const fs 	  = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');

const upload = (object) => new Promise((resolve, reject) => {

	const filesToUpload = [];

	if (object.m) {
		const stats = fs.statSync(object.src, (err, stats) => {
			if (err)
				console.log("Can't get stat on this file");
		})
		const compress = (object.c) ? true : false;
		const date = new Date().toLocaleString();
		const metadata = `- name : ${object.dest}\n- compress : ${compress}\n- size : ${stats.size}\n- source : ${object.src}\n- date : ${date}`;
		mkdirp(`/tmp/metaTemp/`, err => {
			if (err)
				reject("Can't create directory metaTemp");
			else {
				fs.writeFileSync(`/tmp/metaTemp/${object.dest}`, metadata, err => {
					if (err) reject("Can't create meta file")
				})
				const formData = {
					filename: object.dest,
					src: '/tmp/metaTemp/',
					file: fs.createReadStream(`/tmp/metaTemp/${object.dest}`),
				};
				request.post({ url:`http://127.0.0.1:5000/upload?id=${object.id}`, formData: formData }, (err, http, body) => {
					if (err) console.log(err);
				});
				console.log("New meta file created");
			}
		});
	}


		const formData = {
			filename: object.dest,
			file: fs.createReadStream(object.src),
		};

		request.post({ url:`http://127.0.0.1:5000/upload?id=${object.id}`, formData: formData }, (err, http, body) => {
			if (err) console.log(err);		
		});

		resolve("You have upload the file.");
	
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

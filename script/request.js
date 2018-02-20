const request = require('request');
const fs 	  = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const md5file = require('md5-file');
const archiver = require('archiver');
const Promise = require('bluebird');

const checkIfMeta = ({ m }) => new Promise((resolve, reject) => {
	if (m) resolve();
	reject();
});

const checkIfCompress = ({ c }) => new Promise((resolve, reject) => {
	if (c) resolve();
	reject();
});

const unlinkFile = ({ dest }) => new Promise((resolve, reject) => {
	fs.unlink(`/tmp/metaTemp/${dest}`, err => {
		if (err) reject(`Can't delete /tmp/metaTemp/${dest}`)
		resolve();
	})
});

const writeFile = (path, file) => new Promise((resolve, reject) => {
	fs.writeFile(`/tmp/metaTemp/${path}`, file, err => {
		if (err) reject("Can't create meta file")
		resolve();
	})
});

const getStat = (path) => new Promise((resolve, reject) => {
	fs.stat(path, (err, stats) => {
		if (err) reject("Can't get stat on this file")
		resolve(stats);
	})
});

const createDir = metadata => new Promise((resolve, reject) => {
	mkdirp('/tmp/metaTemp/', err => {
		if (err) reject("Can't create directory metaTemp")
		resolve(metadata);
	})
});

const rp = ({ id }, value, formData) => new Promise((resolve, reject) => {
	request.post({ url:`http://127.0.0.1:5000/upload?id=${id}&value=${value}`, formData: formData }, (err, http, body) => {
		console.log('request');
		if (err) reject(err)
		resolve();
	});
});

const createZip = (newZip) => new Promise((resolve, reject) => {

		const output = fs.createWriteStream(newZip);
		const archive = archiver('zip', {
		  zlib: { level: 9 }
		});
		archive.append(fs.createReadStream(object.src), { name: object.dest });
		if (object.m)
			archive.append(fs.createReadStream(`/tmp/metaTemp/${object.dest}`), { name: 'meta' + object.dest });
		archive.pipe(output);
		archive.on('finish', err => {
				console.log('finish');
		});
		archive.finalize();
		resolve();
});

const upload = (object) => {

	const filesToUpload = [];
	const newZip = (object.c) ? object.dest.match(/(\w*).{1,}/)[1] + '.zip' : false;

	checkIfMeta(object)
	.then(() => getStat(object.src))
	.then(stats => {
		const compress = (object.c) ? true : false;
		const date = new Date().toLocaleString();
		const checksum = md5file.sync(object.src);
		const metadata = `-name: ${object.dest};\n-checksum: ${checksum};\n-compress: ${compress};\n-size: ${stats.size};\n-source: ${object.src};\n-date : ${date}`;
		console.log('then meta')
		return createDir(metadata);
	})
	.then(metadata => writeFile(object.dest, metadata))
	.catch(err => {
		if (err) console.error(err)
	})
	.finally(() => {
		console.log('finally meta')
		return checkIfCompress(object)
	})
	.then(() => {
			console.log('compress then');
			return createZip(newZip)
	})
	.catch(() => {
		console.log('catch compress ');
		if (object.m && !object.c) {
			console.log('send meta file');
			const formData = {
					filename: object.dest,
					src: '/tmp/metaTemp/',
					file: fs.createReadStream(`/tmp/metaTemp/${object.dest}`),
			};
			rp(object, 'meta', formData);
		}
	})
	.finally(() => {
		console.log('final');
		const formData = {
			filename: (object.c) ? newZip : object.dest,
			file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
		};
		console.log(formData);
		rp(object, 'file', formData).then(() => console.log('You have upload the file.')).catch(err => console.log('errrrrrr'));
		if (object.m) unlinkFile(object)
	})
};





		// const stats = fs.statSync(object.src, (err, stats) => {
		// 	if (err)
		// 		console.log("Can't get stat on this file");
		// })
		
		// mkdirp(`/tmp/metaTemp/`, err => {
		// 	if (err) reject("Can't create directory metaTemp")
		// 	else {
		// 		fs.writeFileSync(`/tmp/metaTemp/${object.dest}`, metadata, err => {
		// 			if (err) reject("Can't create meta file")
		// 		})
		// 		const formData = {
		// 			filename: object.dest,
		// 			src: '/tmp/metaTemp/',
		// 			file: fs.createReadStream(`/tmp/metaTemp/${object.dest}`),
		// 		};
		// 		request.post({ url:`http://127.0.0.1:5000/upload?id=${object.id}&value=meta`, formData: formData }, (err, http, body) => {
		// 			if (err) console.log(err);
		// 			else {
		// 				fs.unlinkSync(`/tmp/metaTemp/${object.dest}`, err => {
		// 					if (err) reject(`Can't delete /tmp/metaTemp/${object.dest}`)
		// 				})
		// 			}
		// 		});
		// 		console.log("You have upload the meta file");
		// 	}
		// });

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

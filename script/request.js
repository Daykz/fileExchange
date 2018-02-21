const request = require('request');
const fs 	  = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const md5file = require('md5-file');
const archiver = require('archiver-promise');
const Promise = require('bluebird');

const checkIfMeta = ({ m }) => new Promise((resolve, reject) => {
	if (m) resolve();
	reject();
});

const checkIfCompress = ({ c }) => new Promise((resolve, reject) => {
	if (c) resolve();
	reject();
});

const unlinkFile = (path) => new Promise((resolve, reject) => {
	fs.unlink(path, err => {
		if (err) reject(`Can't delete ${path}`)
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

const rp = ({ id }, formData) => new Promise((resolve, reject) => {
	request.post({ url:`http://127.0.0.1:5000/upload?id=${id}`, formData: formData }, (err, http, body) => {
		console.log('request');
		if (err) reject(err)
		resolve();
	});
});

const absolutePath = (path) => path.match(/(\w*).{1,}/)[1];

const createZip = (object, newZip) => new Promise((resolve, reject) => {

		const output = fs.createWriteStream(newZip);
		const archive = archiver(newZip, {
		  zlib: { level: 9 }
		});
		console.log(object.src);
		archive.append(fs.createReadStream(object.src), { name: object.dest });
		if (object.m)
			archive.append(fs.createReadStream(`/tmp/metaTemp/${absolutePath(object.dest)}.txt`), { name: 'meta-' + absolutePath(object.dest) + '.txt' });
		archive.pipe(output);
		archive.finalize().then(() => resolve()).catch(err => reject(err));
});

const upload = (object) => {

	const newZip = (object.c) ? absolutePath(object.dest) + '.zip' : false;

	checkIfMeta(object)
	.then(() => getStat(object.src))
	.then(stats => {
		const compress = (object.c) ? true : false;
		const date = new Date().toLocaleString();
		const checksum = md5file.sync(object.src);
		const metadata = `-name: ${object.dest}.txt;\n-checksum: ${checksum};\n-compress: ${compress};\n-size: ${stats.size};\n-source: ${object.src};\n-date : ${date}`;
		console.log('then meta')
		return createDir(metadata);
	})
	.then(metadata => writeFile(absolutePath(object.dest) + '.txt', metadata))
	.catch(err => {
		if (err) console.error(err)
	})
	.finally(() => {
		console.log('finally meta')
		return checkIfCompress(object)
	})
	.then(() => {
			console.log('compress then');
			return createZip(object, newZip)
	})
	.catch(() => {
		console.log('catch compress ');
		if (object.m && !object.c) {
			console.log('send meta file');
			const formData = {
					filename: object.dest,
					src: '/tmp/metaTemp/',
					file: fs.createReadStream(`/tmp/metaTemp/${absolutePath(object.dest)}.txt`),
			};
			rp(object, formData);
		}
	})
	.finally(() => {
			console.log('final');
			const formData = {
				filename: (object.c) ? newZip : absolutePath(object.dest) + '.txt',
				originalname: absolutePath(object.dest) + '.txt',
				meta: (object.m) ? 'true' : '',
				file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
			};
			rp(object, formData).then(() => console.log('You have upload the file.')).catch(err => console.log('errrrrrr'));
			if (object.m) unlinkFile(`/tmp/metaTemp/${absolutePath(object.dest)}.txt`)
			unlinkFile(newZip);
	})
};

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

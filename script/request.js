const request = require('request');
const fs 	  = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const md5file = require('md5-file');
const archiver = require('archiver-promise');
const Promise = require('bluebird');



const checkIfMetaOptionExist = ({ m }) => new Promise((resolve, reject) => {
	if (m) resolve();
	reject();
});

const checkIfCompressOptionExist = ({ c }) => new Promise((resolve, reject) => {
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
	fs.writeFile(path, file, err => {
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

const createDir = (dirname, metadata) => new Promise((resolve, reject) => {
	mkdirp(dirname, err => {
		if (err) reject(`Can't create directory ${dirname}`)
		resolve(metadata);
	})
});

const rp = ({ id }, formData) => new Promise((resolve, reject) => {
	

	const r = request.defaults({
		'proxy': 'http://localhost:9000',
		headers: {
			proxy: false
		},
		formData: formData
	});

	r.post(`http://localhost:5000/upload?id=${id}`, (err, http, body) => {
		console.log('request');
		if (err) reject(err)
		resolve();
	}).auth('dave', 'dav');
});

const absolutePath = (path) => path.match(/(\w*).{1,}/)[1];

const createZip = ({ src, dest, m }, newZip, pathMeta) => new Promise((resolve, reject) => {
		const output = fs.createWriteStream(newZip);
		const archive = archiver(newZip, {
		  zlib: { level: 9 }
		});
		console.log(src);
		archive.append(fs.createReadStream(src), { name: dest });
		if (m)
			archive.append(fs.createReadStream(`${pathMeta}${absolutePath(dest)}.js`), { name: 'meta-' + absolutePath(dest) + '.js' });
		archive.pipe(output);
		archive.finalize().then(() => resolve('archive finalize')).catch(reject);
});

const upload = (object) => {

	const newZip = (object.c) ? absolutePath(object.dest) + '.zip' : false;
	const pathToGetMetaFile = '/tmp/metaTemp';

	checkIfMetaOptionExist(object)
	.then(() => getStat(object.src))
	.then(stats => {
		const compress = (object.c) ? true : false;
		const date = new Date().toLocaleString();
		const checksum = md5file.sync(object.src);
		const metadata = `const metadata = {\n\tname: '${object.dest}',\n\tchecksum: '${checksum}',\n\tcompress: '${compress}',\n\tsize: '${stats.size}',\n\tsource: '${object.src}',\n\tdate : '${date}'\n}\n\nmodule.exports = metadata;`;
		console.log('then meta');
		return createDir(pathToGetMetaFile, metadata);
	})
	.then(metadata => writeFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`, metadata))
	.catch(err => {
		if (err) console.error(err)
	})
	.finally(() => {
		console.log('finally meta')
		return checkIfCompressOptionExist(object)
	})
	.then(() => {
			console.log('compress then');
			createZip(object, newZip, pathToGetMetaFile).then(result => {
				console.log(result);
				const formData = {
					filename: (object.c) ? newZip : object.dest,
					absolutename: absolutePath(object.dest),
					meta: (object.m) ? 'true' : '',
					file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
				};
				rp(object, formData).then(() => {
					console.log('You have upload the file.')
					if (object.m) unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)
					// if (newZip) unlinkFile(newZip)
				})
			})
	})
	.catch(() => {
		console.log('catch compress ');
		if (object.m && !object.c) {
			console.log('send meta file');
			const formData = {
					filename: object.dest,
					src: pathToGetMetaFile,
					file: fs.createReadStream(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`),
			};
			rp(object, formData);
		}
	})
	.finally(() => {
			if (!object.c) {
				console.log('final');
				const formData = {
					filename: (object.c) ? newZip : object.dest,
					absolutename: absolutePath(object.dest),
					meta: (object.m) ? 'true' : '',
					file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
				};
				rp(object, formData).then(() => {
					console.log('You have upload the file.')
					if (object.m) unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)
					// if (newZip) unlinkFile(newZip)
				})
				.catch(err => console.log(err));
			}
	})
};

const download = ({ src, dest }) => new Promise((resolve, reject) => {
	request.get('http://127.0.0.1:5000/download', {
		qs: {
			path: src
		}
	}, (err, res, body) => {
		if (err || res.statusCode == 403) reject("You can't download the file.");
		else resolve('You have download the file.');
	})
	.pipe(fs.createWriteStream(path.resolve(dest)));
});

module.exports = { upload, download }

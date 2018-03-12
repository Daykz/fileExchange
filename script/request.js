const request = require('request');
const fs 	  = require("fs");
const path = require('path');
const mkdirp = require('mkdirp');
const md5file = require('md5-file');
const archiver = require('archiver-promise');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');




const unlinkFile = (path) => new Promise((resolve, reject) => {
	fs.unlink(path, err => {
		if (err) reject(`Can't delete ${path}`)
		resolve();
	})
});



const rp = ({ id }, formData) => new Promise((resolve, reject) => {
	

	const token = jwt.sign({ foo: 'bar' }, 'shhhhh');
	console.log(token)
	const r = request.defaults({
		// proxy: 'http://178.62.77.158:9000',
		headers: {
			proxy: false,
			token: token
		},
		formData: formData
	});

	r.post(`http://178.62.77.158?id=${id}`, (err, http, body) => {
		console.log('request');
		if (err) reject(`Error rp(): ${err}`)
		resolve();
	}).auth('dave', 'dav');
});

const absolutePath = (path) => path.match(/(\w*).{1,}/)[1];

const writeFile = (path, file) => new Promise((resolve, reject) => {
	fs.writeFile(path, file, err => {
		if (err) reject("Can't create meta file")
		resolve();
	})
});

const createDirAndWriteMetafile = ({ dest }, dirname, metadata) => new Promise((resolve, reject) => {
	console.log('create dir temp');
	mkdirp(dirname, err => {
		if (err) reject(`Can't create directory ${dirname}`)
		console.log('create metafile')
		writeFile(`${dirname}${absolutePath(dest)}.js`, metadata)
		.then(() => resolve()).catch(err => reject(err))
	})
});

const getStat = ({ src, c, dest }) => new Promise((resolve, reject) => {
	console.log('get Stat');
	fs.stat(src, (err, stats) => {
		if (err) reject("Can't get stat on this file")

		const compress = (c) ? true : false;
		const date = new Date().toLocaleString();
		const checksum = md5file.sync(src);
		const metadata = `const metadata = {\n\tname: '${dest}',\n\tchecksum: '${checksum}',\n\tcompress: '${compress}',\n\tsize: '${stats.size}',\n\tsource: '${src}',\n\tdate : '${date}'\n}\n\nmodule.exports = metadata;`;
		console.log('then meta');

		resolve(metadata);
	})
});

const checkIfMetaOptionExist = (object) => new Promise((resolve, reject) => {
	console.log(`check meta ${object.m}`);
	if (object.m) getStat(object).then(metadata => resolve(metadata)).catch(err => reject(err))
	else reject();
});

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
		archive.finalize().then(() => resolve()).catch(() => reject(`Can't create archive`));
});

const checkIfCompressOptionExist = (object, newZip, pathToGetMetaFile) => new Promise((resolve, reject) => {
	if (object.c) createZip(object, newZip, pathToGetMetaFile).then(() => resolve()).catch(err => reject(err));
	else reject();
});

const upload = (object) => {

	const newZip = (object.c) ? absolutePath(object.dest) + '.zip' : false;
	const pathToGetMetaFile = '/tmp/metaTemp/';

	checkIfMetaOptionExist(object)
	.then(metadata => createDirAndWriteMetafile(object, pathToGetMetaFile, metadata))
	.catch(err => {
		if (err) console.error(err)
	})
	.finally(() => checkIfCompressOptionExist(object, newZip, pathToGetMetaFile))
	.then(() => {
		console.log('then compress')
		const formData = {
			filename: (object.c) ? newZip : object.dest,
			absolutename: absolutePath(object.dest),
			meta: (object.m) ? 'true' : '',
			file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
		};
		rp(object, formData).then(() => {
			if (object.m) unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)
			if (newZip) unlinkFile(newZip)
		})
		.catch(console.error)
	})
	.catch(() => {
		const formData = {
			filename: (object.c) ? newZip : object.dest,
			absolutename: absolutePath(object.dest),
			meta: (object.m) ? 'true' : '',
			file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
		};
		console.log(formData);
		rp(object, formData).then(() => {
			if (newZip) unlinkFile(newZip)
		})
		.catch(console.error);

		if (object.m) {
			const formData = {
					filename: absolutePath(object.dest) + '.js',
					src: pathToGetMetaFile,
					file: fs.createReadStream(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`),
			};
			rp(object, formData).then(() => unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)).catch(console.error);
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

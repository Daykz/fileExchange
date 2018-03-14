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

const absolutePath = (path) => path.match(/(\w*).{1,}/)[1];

const writeMetaFile = (path, file) => new Promise((resolve, reject) => {
	fs.writeFile(path, file, err => {
		if (err) reject("Can't create meta file")
		resolve();
	})
});

const getStat = (src) => new Promise((resolve, reject) => {
		fs.stat(src, (err, stats) => {
			if (err) reject("Can't get stat on this file");
			resolve(stats);
		});
});

const getMetaDataFile = async ({ src, c, dest }) => {
	console.log('get Stat');
	const stats = await getStat(src);
	console.log('stats = ', stats)
	const compress = (c) ? true : false;
	const date = new Date().toLocaleString();
	const checksum = md5file.sync(src);
	const metadata = `const metadata = {\n\tname: '${dest}',\n\tchecksum: '${checksum}',\n\tcompress: '${compress}',\n\tsize: '${stats.size}',\n\tsource: '${src}',\n\tdate : '${date}'\n}\n\nmodule.exports = metadata;`;
	console.log('then meta');

	return metadata;
};

const createDir = (dirname) => new Promise((resolve, reject) => {
	mkdirp(dirname, err => {
		if (err) reject(`Can't create directory ${dirname}`)
		resolve();
	})
});

const createDirAndWriteMetafile = async ({ dest }, dirname, metadata) => {
	console.log('create dir temp');
	await createDir(dirname)
	await writeMetaFile(`${dirname}${absolutePath(dest)}.js`, metadata)
};

const createZipFile = async ({ src, dest, m }, newZip, pathMeta) => {
		const output = fs.createWriteStream(newZip);
		const archive = archiver(newZip, {
		  zlib: { level: 9 }
		});
		archive.append(fs.createReadStream(src), { name: dest });
		if (m) archive.append(fs.createReadStream(`${pathMeta}${absolutePath(dest)}.js`), { name: 'meta-' + absolutePath(dest) + '.js' });
		archive.pipe(output);
		await archive.finalize().catch(() => reject(`Can't create archive`));
		return;
};

const rp = async ({ id }, formData) => {
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

	await new Promise((resolve, reject) => {
		r.post(`http://178.62.77.158:5000/upload?id=${id}`, (err, http, body) => {
			console.log('request');
			if (err) reject(`Error rp(): ${err}`)
			resolve();
		}).auth('dave', 'dav');
	});
};

const upload = async (object) => {

	const newZip = (object.c) ? absolutePath(object.dest) + '.zip' : false;
	const pathToGetMetaFile = '/tmp/metaTemp/';

	if (object.m) {
		try {	
			const metadata = await getMetaDataFile(object);
			await createDirAndWriteMetafile(object, pathToGetMetaFile, metadata);
		}
		catch (e) {console.error(e)}
	}
	if (object.c) {
		try {
			await createZipFile(object, newZip, pathToGetMetaFile)
			const formData = {
				filename: (object.c) ? newZip : object.dest,
				absolutename: absolutePath(object.dest),
				meta: (object.m) ? 'true' : '',
				file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
			};
			await rp(object, formData).catch(console.error)
			if (object.m) unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)
			if (newZip) unlinkFile(newZip)
		}
		catch (e) {console.error(e)}
	}
	else {
		if (object.m) {
			const formData = {
					filename: absolutePath(object.dest) + '.js',
					src: pathToGetMetaFile,
					file: fs.createReadStream(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`),
			};
			console.log('1')
			await rp(object, formData).catch(console.error);
			console.log('1')
			unlinkFile(`${pathToGetMetaFile}${absolutePath(object.dest)}.js`)
		}
		const formData = {
			filename: (object.c) ? newZip : object.dest,
			absolutename: absolutePath(object.dest),
			meta: (object.m) ? 'true' : '',
			file: (object.c) ? fs.createReadStream(newZip) : fs.createReadStream(object.src),
		};
		await rp(object, formData).catch(console.error)
		if (newZip) unlinkFile(newZip)
	}
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

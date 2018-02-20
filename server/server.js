const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer       = require('multer');
const fs 		= require('fs');
let conf = require('./conf');
const mkdirp = require('mkdirp');
const exec = require('child_process').exec;
const md5file = require('md5-file');

const storage	= multer.diskStorage({
	destination: (req, file, cb) => (req.body.src) ? cb(null, path.resolve(conf(req.query.id).REP_EVENT)) : cb(null, path.resolve(conf(req.query.id).REP_DEST)),
	filename: (req, file, cb) => cb(null, req.body.filename),
});
const upload		= multer({storage: storage}).single('file');

const port 		= process.env.PORT || 5000;

const createDir = (path) => new Promise((resolve, reject) => {
	mkdirp(path, err => {
		if (err) reject("Can't create new directory")
		console.log('create dir');
		resolve("New directory created");
	})
});

const exists = (path) => new Promise((resolve, reject) => {
	fs.access(path, err => {
		if (err) resolve(false)
		resolve(true);
	})
});


const uploadFile = (req, res) => new Promise((resolve, reject) => {
	upload(req, res, err => {
		if (err) reject(err)
		resolve();
	})
})


const api = () => {
  const sousapp = express();
	sousapp.get('/download', (req, res, next) => {
				fs.access(req.query.path, fs.constants.R_OK | fs.constants.F_OK, err => {
					if (err)
					{
					  console.log('Someone try to access to this file: ' + req.query.path);
					  res.status(403).send('You have no access to this file');
					}
					else
						res.download(path.resolve(req.query.path));
				});
			})
			.post('/upload', (req, res, next) => {
				exists(path.resolve(conf(req.query.id).REP_DEST))
				.then(err => {
					if (!err) {
						mkdirp.sync(conf(req.query.id).REP_DEST);
					}
					return exists(path.resolve(conf(req.query.id).REP_EVENT))
				})
				.then(err => {
					if (!err) {
						mkdirp.sync(conf(req.query.id).REP_EVENT)
					}
					console.log('upload bef');
					return uploadFile(req, res);
				})
				.then(() => {
					console.log('enter upload');
					if (req.query.id === 'wd_unknow') exec(conf(req.query.id).EXEC)

					const pathfile = conf(req.query.id).REP_DEST + '/' + req.body.filename;
					const pathmeta = conf(req.query.id).REP_EVENT + '/' + req.body.filename;

					if (req.query.value === 'meta') {
						fs.readFile(pathmeta, (err, data) => {
							const content = JSON.stringify(data.toString('utf8'));
							const arrayMatch = content.match(/checksum: (\w*);/);
							if (arrayMatch[1] !== md5file.sync(pathfile))
								console.log('checksum is wrong.');
						})
					}
					res.send('You have upload the file.')
				})
				.catch(err => {
					res.send(err);
				})
			})
	return sousapp;
}



app.use(bodyParser.urlencoded({ extended: true }))
   .use(bodyParser.json())
   .use('/', api());

app.listen(port);
console.log('Magic happens on port ' + port)
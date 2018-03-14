const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer       = require('multer');
const fs 		= require('fs');
let conf = require('./conf');
// let toujours après les const !
const mkdirp = require('mkdirp');
const exec = require('child_process').exec;
const md5file = require('md5-file');
const decompress = require('decompress');
const mv = require('mv');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const storage	= multer.diskStorage({
	destination: (req, file, cb) => (req.body.src) ? cb(null, conf(req.query.id).REP_EVENT) : cb(null, conf(req.query.id).REP_DEST),
	filename: (req, file, cb) => cb(null, req.body.filename),
});

const upload		= multer({storage: storage}).any('file');

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
});

const unlinkFile = (path) => new Promise((resolve, reject) => {
	fs.unlink(path, err => {
		if (err) reject(`Can't delete ${path}`)
		resolve();
	})
});


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
				console.log(req.headers)
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
					if (req.body.filename.match('.zip')) {
						decompress(conf(req.query.id).REP_DEST + req.body.filename, conf(req.query.id).REP_DEST)
						.then(files => {
							console.log('decompress success');
							unlinkFile(conf(req.query.id).REP_DEST + req.body.filename).catch(console.error);
							if (req.body.meta)
								mv(conf(req.query.id).REP_DEST + 'meta-' + req.body.absolutename + '.js', conf(req.query.id).REP_EVENT + 'meta-' + req.body.absolutename + '.js', err => {
							if (err) console.log(err);
							})
						});
					}
					if (req.query.id === 'wd_unknow') exec(conf(req.query.id).EXEC)
					res.status(201).send('You have upload the file.')
				})
				.catch(err => {
					res.send(err);
				})
			})
	return sousapp;
}

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
	  console.log(`Worker ${process.pid} started`);
	  
		app.use(bodyParser.urlencoded({ extended: true }))
		   .use(bodyParser.json())
		   .use('/', api());

		app.listen(port);
		console.log('Magic happens on port ' + port);
}

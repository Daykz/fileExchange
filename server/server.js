const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer       = require('multer');
const fs 		= require('fs');
let conf = require('./conf');
const mkdirp = require('mkdirp');
const exec = require('child_process').exec;

const storage	= multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.resolve(conf(req.query.id).REP_DEST)),
	filename: (req, file, cb) => cb(null, req.body.filename),
})
const upload		= multer({storage: storage}).single('file');

const port 		= process.env.PORT || 5000;


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
				fs.access(path.resolve(conf(req.query.id).REP_DEST), err => {
					if (err) {
						mkdirp.sync(path.resolve(conf(req.query.id).REP_DEST), err => {
							if (err)
								res.end("Can't create new directory")
							else
								console.log("New directory created");
						});
					}
					upload(req, res, function (err) {
						if (err)
							res.end('Error upload');
						else {
							if (req.query.id === 'wd_unknow')
								exec(conf(req.query.id).EXEC);
							res.end('You have upload the file');
						}
					})
				});
			});
	return sousapp;
}



app.use(bodyParser.urlencoded({ extended: true }))
   .use(bodyParser.json())
   .use('/', api());

app.listen(port);
console.log('Magic happens on port ' + port);




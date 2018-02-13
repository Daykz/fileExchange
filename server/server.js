const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const path = require('path');
const multer       = require('multer');
const fs 		= require('fs');
const storage	= multer.diskStorage({
	destination: (req, file, cb) => cb(null, req.body.path),
	filename: (req, file, cb) => cb(null, req.body.filename),
})
const upload		= multer({storage});

const port 		= process.env.PORT || 5000;


const api = () => {
  const sousapp = express();
	sousapp.get('/download', (req, res, next) => {
				fs.access(req.query.path, fs.constants.R_OK, err => {
					if (err)
					{
					  console.log('Someone try to access to this file: ' + req.query.path);
					  res.status(403).send('You have no access to this file');
					}
					else
						res.download(path.resolve(req.query.path));
				});
			})
			.post('/upload', upload.single('file'), (req, res, next) => {
				res.send('You have upload the file');
			});
	return sousapp;
}



app.use(bodyParser.urlencoded({ extended: true }))
   .use(bodyParser.json())
   .use('/', api());

app.listen(port);
console.log('Magic happens on port ' + port);




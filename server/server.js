const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const multer       = require('multer');
const storage	= multer.diskStorage({
	destination: (req, file, cb) => cb(null, req.body.path),
	filename: (req, file, cb) => cb(null, file.originalname),
})
const upload		= multer({storage});

const port 		= process.env.PORT || 5000;


const api = () => {
  const sousapp        = express();
	sousapp.get('/download', (req, res, next) => {
				// habitue toi à toujours envoyé des status avec tes reponse:
				//		res.status(200).send('Everythings ok.');
				//		res.status(500).send('Server internal error.')
				//		res.status(404).send('Not found.')
				res.send('You have download the file');
			})
			.post('/upload', upload.single('file'), (req, res, next) => {
				console.log(req.file);
				res.send('You have upload the file');
			});
	return sousapp;
}
// const inputTxt = process.argv[2];
// const outputTxt = process.argv[3];

// const readerStream = fs.createReadStream(inputTxt);
// const writerStream = fs.createWriteStream(outputTxt);
// console.log(inputTxt, outputTxt);


// readerStream.pipe(writerStream);



app.use(bodyParser.urlencoded({ extended: true }))
   .use(bodyParser.json())
   .use('/', api());

app.listen(port);
console.log('Magic happens on port ' + port);




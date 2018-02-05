const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');


// const api		= require('./api');

const port 		= process.env.PORT || 5000;


const api = () => {
  const sousapp        = express();
	sousapp.get('/download', (req, res, next) => {
				res.send('You have download the file');
			})
			.post('upload', (req, res, next) => {
				console.log('res: ', res);
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




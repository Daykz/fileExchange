const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const cors	   	= require('cors');
   // pour l'instant pas besoin de cors()
const fs 		= require("fs");


const inputTxt = process.argv[2];
const outputTxt = process.argv[3];

console.log(inputTxt, outputTxt);

const readerStream = fs.createReadStream(inputTxt);

const writerStream = fs.createWriteStream(outputTxt);

readerStream.pipe(writerStream);


app.use(bodyParser.urlencoded({ extended: true }))
   .use(bodyParser.json())
   .use(cors());

// essaye de tjrs declarer tes variabkles en haut du fichier
const port = process.env.PORT || 5000;

app.listen(port);
console.log('Magic happens on port ' + port);




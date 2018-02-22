const fs = require('fs');


const checkDirAccessW = (path) => new Promise((resolve, reject) => {
	fs.access(path, fs.constants.W_OK, err => {
		if (err) reject(`You can't access this directory.`);
		resolve();
	});
});

const checkFileAccessR = (path) => new Promise((resolve, reject) => {
	fs.access(path, fs.constants.R_OK | fs.constants.F_OK, err => {
		if (err) reject(`You can't access this file.`);
		resolve();
	});
});


const getDir = path => path.lastIndexOf('/') < 0 ? './' : path.slice(0, path.lastIndexOf('/'));


const parsePath = (src, dest, op) => new Promise((resolve, reject) => {
	if (op == 'download')
		checkDirAccessW(getDir(dest)).then(resolve).catch(reject);
	else if (op == 'upload')
		checkFileAccessR(src).then(resolve).catch(reject);
	else
		reject('Parse failed.\nUsage: "node myScript.js src=<path> dest=<path> op=<upload||download>"');
});

const parsing = ({ src, dest, op }) => new Promise((resolve, reject) => {
		parsePath(src, dest, op).then(resolve).catch(reject);
});


module.exports = parsing;

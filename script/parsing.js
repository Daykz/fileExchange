const fs = require('fs');


const checkDirAccessW = (path) => {
	fs.access(path, fs.constants.W_OK, err => {
		if (err) {
			console.log(`You can't access this directory.`);
			process.exit(1);
		}
	});
};

const checkFileAccessR = (path) => {
	fs.access(path, fs.constants.R_OK | fs.constants.F_OK, err => {
		if (err) {
			console.log(`You can't access this file.`);
			process.exit(1);
		}
	});
};

const getDir = (path) => {
	const pos = path.lastIndexOf('/');
	const dir = (pos == -1) ? './' : path.slice(0, pos);
	
	return dir;
}

const parsePath = (src, dest, op) => {
	if (op == 'download')
		checkDirAccessW(getDir(dest));
	else if (op == 'upload')
		checkFileAccessR(src);
};

const parsing = ({src, dest, op}) => {
	if (src && dest  
		&& op && (op == 'upload' || op == 'download'))
		parsePath(src, dest, op) ;
	else
	{
		console.log('Parse failed.\nUsage: "node myScript.js src=<file-path> dest=<directory-path/> name=<file-name> op=<upload||download>"');
		process.exit(1);
	}
};


module.exports = parsing;
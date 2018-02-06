const parsing = (params) => {
	//	({ src, dest, op })
	if (params.src && params.dest 
		&& params.op && (params.op == 'upload' || params.op == 'download'))
		return ;
	else
	{
		console.log('Parse failed.\nUsage: "node myScript.js src=<path> dest=<path> op=<upload||download>"');
		// toujours exit() avec un int .. 1 ou 0 en fonction de erreur ou success
		process.exit();
	}
}

module.exports = parsing;

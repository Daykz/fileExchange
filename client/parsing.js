const parsing = (params) => {
	if (params.src && params.dest 
		&& params.op && (params.op == 'upload' || params.op == 'download'))
		return ;
	else
	{
		console.log('Parse failed.\nUsage: "node myScript.js src=<path> dest=<path> op=<upload||download>"');
		process.exit();
	}
}

module.exports = parsing;
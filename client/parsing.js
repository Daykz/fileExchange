const parsing = ({src, dest, op}) => {
	if (src && dest 
		&& op && (op == 'upload' || op == 'download'))
		return ;
	else
	{
		console.log('Parse failed.\nUsage: "node myScript.js src=<path> dest=<path> op=<upload||download>"');
		exit(1);
	}
}

module.exports = parsing;

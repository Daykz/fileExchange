const parsing = (params) => {
	console.log(params);
	if (params.length == 5)
		if (params[params.length - 1] == 'upload')
			return 1;
		else if (params[params.length - 1] == 'download')
			return 2;
		else
			console.log('Wrong');	
	else
		console.log('Wrong');
}

module.exports = parsing;
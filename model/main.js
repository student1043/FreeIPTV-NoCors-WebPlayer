const fs = require('fs');

let page = '';

let data = fs.readFileSync('channels.json');
	data = JSON.parse( data );
	
data.forEach( x=>{
	try{
	
	
		let language = x.languages[0].code;
		let location = x.countries[0].code;
		let category = x.category;

/*
		if( category != 'xxx' && (
		(	language=='spa' ||
			language=='rus'	||
			language=='es'  ||
			language=='en'  ||
			language=='us') &&
			x.logo != null
		))	
*/

		if( x.logo != null )	
		page+=`${JSON.stringify(x)}\n`;
		
	} catch(e) { }
});

fs.writeFileSync( 'output.json',page );
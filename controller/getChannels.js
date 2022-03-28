
let i=0, page = '';

const readline = require('readline').createInterface({
  	input: fs.createReadStream(`${mollyJS.dirname}/model/output.json`)
});

loadPage = (line)=>{
	try{
		const data = JSON.parse( line );  
			  data.logo = data.logo.replace(/:\/\//g,'_');
		  	  data.url = data.url.replace(/:\/\//g,'_');
		  	  
		return `
			<a class="uk-padding-small" onclick="show('vid?path=${data.url}')" id="channel" uk-toggle='target:modal;'>
		  		<img data-src="/img?path=${data.logo}" src="/img/placeholder.png" class="uk-height-small" alt="${data.name}">
		  	</a>
		`;
	} catch(e) {} return '';
}

readline.on('line', (line)=>{

	const data = JSON.parse( line );

	if( i>=req.query.start && i<(Number(req.query.end)+Number(req.query.start)) ){
		
		if( mollyJS.slugify( line ).search( mollyJS.slugify( req.query.filter ) )>=0 || req.query.filter == 'null' ){	
			page += loadPage( line ); i++;
		}	
		
	} else if( mollyJS.slugify( line ).search( mollyJS.slugify( req.query.filter ) )>=0 || req.query.filter == 'null' ) 
		i++;
	 else if( i>(Number(req.query.end)+Number(req.query.start)) ) 
		readline.close();

});

readline.on('close', ()=>{ res.send( 200, page ); });
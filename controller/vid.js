
let _pvr = req.url.replace('/vid?path=','');
let _url = req.url.replace('/vid?path=','');

	_prv = _pvr.replace(/ /g,'+').split('/');
	_url = _url.replace(/_/,'://');
	_url = _url.replace(/ /g,'+');
	
axios( _url,{responseType: 'text'} )
.then( response=>{
	
	let page = '';
	let line = response.data.split('\n');
		line.pop();
	
	for( var i in line ){	
		if( !line[i].startsWith('#') ){
		
			let newURL = new String();
			_prv[ _prv.length-1 ] = line[i];
			
			if( line[i].search('http')>=0 )
				newURL = `${line[i].replace(/:\/\//,'_')}\n`;
			else
				newURL = `${_prv.join('/')}\n`;
				
			if( newURL.search('.m3u8')>0 )
				page += `vid?path=${newURL}`;
			else
				page += `img?path=${newURL}`;
				
		continue; } 	
		
		//	if( !line[i].search('#EXT-X-KEY')>=0 ) continue
			page += `${line[i].replace(/http/,'/img?path=http').replace(/:\/\//g,'_')}\n`;
		//	page += `${line[i]}\n`;
		
	}
	
	res.send( 200, page );
	
}).catch( err=>{ res.send( 404, 'something went wrong' ); });

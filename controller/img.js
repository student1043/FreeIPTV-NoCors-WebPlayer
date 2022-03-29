let _pvr = req.url.replace('/img?path=','');
let _url = req.url.replace('/img?path=','');

	_prv = _pvr.replace(/ /g,'+').split('/');
	_url = _url.replace(/_/,'://');
	_url = _url.replace(/ /g,'+');

axios( _url,{responseType: 'arraybuffer'} )
.then( response=>{ res.send( 200, response.data ); })
.catch( err=>{ res.send( 404, 'something went wrong' ); });

$$$= (...args) =>{ return args[0].addEventListener(args[1],args[2]); }
$$ = (...args) =>{ return document.querySelectorAll(args); }
$  = (...args) =>{ return document.querySelector(args); }


//TODO: CONSTANTS  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//

const query = new URLSearchParams( window.location.search );
const db = new Object();
query.append('end',80);

// lazyImage Fuction XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX   //

lazyImage = ( dom )=>{
	const config = { rootMargin: '250px 0px' };
	var observer = new IntersectionObserver( (entries, observer)=>{
		entries.forEach( entry=>{
			image = entry.target;
			if( entry.isIntersecting ){
				image.src = image.dataset.src;
				observer.unobserve( image );
			}
		});
	} , config);
	$$( dom ).forEach( (image)=>{ observer.observe(image) });
}

// update Fuction XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX  //

loadChannels = ()=>{
	if( $('spinner').hidden ){ 
	
		$('spinner').hidden = false;
		const start = $$('#channel').length;
		
		fetch(`/getChannels?filter=${query.get('filter')}&start=${start}&end=${query.get('end')}`)
		.then( async(response)=>{ 
			$('#channels').innerHTML+=( await response.text() );
			$('spinner').hidden = true; lazyImage('#channel>img');
		});
		
	}	
}

events = ()=>{
	$$$( $('#loadmore'), 'click', function(){ loadChannels(); });
	$$$( $('#close'),'click',()=>{ 
		$('video').src=""; 
		db.hls.destroy();
		delete db.hls;
	});
	$$$( $('#txt_search'),'change', ()=>{ 
		let val = $('#txt_search').value;
		window.location.href = `/?filter=${val}`;
	});
}

show = ( _url )=>{
	
	if (Hls.isSupported()) {
		db.hls = new Hls();
		db.hls.loadSource( _url );
		db.hls.attachMedia( $('video') );
	}
	
	else if ( $('video').canPlayType('application/vnd.apple.mpegurl') ) {
		$('video').src = _url;
	}
}

// Main Fuction XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
$$$( window, 'load', function(){
	loadChannels(); events();
});

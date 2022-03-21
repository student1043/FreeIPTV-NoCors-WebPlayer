//TODO: Libreries   XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //

const axios = require('axios');
const https = require('http2');
const http = require('http');
const url = require('url');
const fs = require('fs');

//TODO: String Normalization ################################################ //
const slugify = str => { const map = {
    'c' : 'ç|Ç','n' : 'ñ|Ñ',
   	'e' : 'é|è|ê|ë|É|È|Ê|Ë',
   	'i' : 'í|ì|î|ï|Í|Ì|Î|Ï',
   	'u' : 'ú|ù|û|ü|Ú|Ù|Û|Ü',
   	'o' : 'ó|ò|ô|õ|ö|Ó|Ò|Ô|Õ|Ö',
   	'a' : 'á|à|ã|â|ä|À|Á|Ã|Â|Ä',
	''	: ` |:|_|!|¡|¿|\\?|#|/|,|-|'|"|’`,
};	for (var pattern in map) { 
		str=str.replace( new RegExp(map[pattern],'g' ), pattern); 
	}	return str.toLowerCase();
}

//TODO: String Normalization XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
const mimeType = {    
    "bmp" : "image/bmp",
    "gif" : "image/gif",
    "png" : "image/png",
    "jpg" : "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "svg" : "image/svg+xml",
    
    "aac" : "audio/aac",
    "wav" : "audio/wav",
    "weba": "audio/webm",
    "mp3" : "audio/mpeg",
    
    "mp4" : "video/mp4",
    "webm": "video/webm",
    "ts"  : "video/mp2t",
    "mpeg": "video/mpeg",
    "avi" : "video/x-msvideo",

	"fbx" : "text/plain",
	"dae" : "text/plain",
	"mtl" : "text/plain",
	"obj" : "text/plain",
	"glb" : "text/plain",
	"gltf": "text/plain",
    
    "css" : "text/css",
    "csv" : "text/csv",
    "html": "text/html",
    "text": "text/plain",
    "js"  : "text/javascript",
    
    "zip" : "application/zip",
    "pdf" : "application/pdf",
    "gz"  : "application/gzip",
    "json": "application/json",
    "tar" : "application/x-tar",
    "rar" : "application/vnd.rar",
    "7z"  : "application/x-7z-compressed",
    "m3u8": "application/vnd.apple.mpegurl",
};

//TODO: Main Class  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //

class molly_class{

	constructor( Port, front_path, back_path ){
		this.port = process.env.PORT || Port;
		this.max_age = 1000 * 60 * 60 * 24;
		this.timeout = 1000 * 60 * 10;
		this.front= `${front_path}`;
		this.back = `${back_path}`; 
	}
	
	header=( mimeType="text/plain" )=>{
		return {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': `max-age=${this.max_age}; preload`,
		//	'cache-control': `public, max-age=${this.max_age}`,
		//	'Access-Control-Allow-Origin':'*',
			'Content-Type':mimeType 
		};
	}

	chunkheader=( start,end,size,mimeType="text/plain" )=>{
		const contentLength = end-start+1;
		return {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': `max-age=${this.max_age}; preload`,
		//	'cache-control': `public, max-age=${this.max_age}`,
			"Content-Range":`bytes ${start}-${end}/${size}`,
		//	"Access-Control-Allow-Origin":"*",
			"Content-Length":contentLength,
			"Content-Type": mimeType,
			"Accept-Ranges":"bytes",
		};
	}
	
	router=( req,res )=>{
		req.parse = url.parse(req.url, true);
		req.query = req.parse.query;
		
		//TODO: _main_ Function  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		try{
			let data = fs.readFileSync(`${this.back}/_main_.js`);
			eval( data.toString() );// return 0;
		} catch(e) { }
	
		//TODO: Server Pages XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		if( req.parse.pathname=="/" ){
			fs.readFile(`${this.front}/index.html`, (err,data)=>{
				if (err) {
					res.writeHead(404, this.header('text/html'));
					return res.end( this._404_() ); }
				res.writeHead(200, this.header('text/html'));
				return res.end(data);
			});
			
		} else if( fs.existsSync(`${this.front}${req.parse.pathname}.html`) ) {
			let data = fs.readFileSync(`${this.front}${req.parse.pathname}.html`);
			res.writeHead(200, this.header('text/html')); 
			return res.end(data);
			
		} else if( fs.existsSync(`${this.back}${req.parse.pathname}.js`) ) {
			let data = fs.readFileSync(`${this.back}${req.parse.pathname}.js`);
			eval(` try{ ${data} } catch(err) { console.log( err );
				res.writeHead(200, this.header('text/html'));
				res.end('something went wrong'); 
			}`);return 0;
		}
	
		//TODO: Server Chunk XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		else{
			const keys = Object.keys(mimeType);
			for( var i in keys ){
				if( req.parse.pathname.endsWith(keys[i]) ){
				
					const range = req.headers.range;
					const url = (`${this.front}${req.parse.pathname}`).replace(/%20/g,' ');
			
					try{	
						if(range) {
							const chuck_size = Math.pow( 10,6 ); 
							const size = fs.statSync( url ).size;
							const start = Number(range.replace(/\D/g,""));
							const end = Math.min(chuck_size+start,size-1);

							res.writeHead(206, this.chunkheader( start,end,size,mimeType[keys[i]] ));
							const chuck = fs.createReadStream( url,{start,end} );
							chuck.pipe( res ); return 0;
						
						} else {
							if( fs.existsSync( url ) ){
								res.writeHead(200, this.header( mimeType[keys[i]] ));
								return res.end( fs.readFileSync( url ) );
							}
						}	
					
					} catch(e) {} return 0;
						
				}
			}
			
			res.writeHead(404, this.header('text/html'));
			res.end( this._404_() );	
		}
	}
	
	startHttpServer=()=>{
		let server = http.createServer( this.router ).listen( this.port,'0.0.0.0',()=>{
			console.log(`server started at http://localhost:${this.port}`);
		}); server.setTimeout( this.timeout );	
	}
		
	startHttpSecureServer=( key_path, cert_path )=>{
		let key = {
			key: fs.readFileSync('localhost-privkey.pem'),
			cert: fs.readFileSync('localhost-cert.pem')
		}
	
		let server = https.createSecureServer( key, this.router ).listen( this.port,'0.0.0.0',()=>{
			console.log(`server started at https://localhost:${this.port}`);
		}); server.setTimeout( this.timeout );		
	}
	
	_404_=()=>{ 
		let url = `${this.front}/404.html`
		if( fs.existsSync(url) )
			return fs.readFileSync(`${this.front}/404.html`); 
		return 'Oops 404 not found';
	}
	
};	mollyJS = molly_class;

//TODO: Main Functions  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //
server = new mollyJS( 3000, './www', './controller' );
server.startHttpServer();




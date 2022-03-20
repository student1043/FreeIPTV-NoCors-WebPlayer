//TODO: Libreries   XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //

const axios = require('axios');
const https = require('http2');
const http = require('http');
const url = require('url');
const fs = require('fs');

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
		this.front= `${front_path}`;
		this.back = `${back_path}`;
	}
	
	header=( mimeType="text/plain" )=>{
		return {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': 'max-age=6000; preload',
		//	'cache-control': 'public, max-age=6000',
		//	'Access-Control-Allow-Origin':'*',
			'Content-Type':mimeType 
		};
	}

	chunkheader=( start,end,size,mimeType="text/plain" )=>{
		const contentLength = end-start+1;
		return {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': 'max-age=6000; preload',
			"Content-Range":`bytes ${start}-${end}/${size}`,
		//	'cache-control': 'public, max-age=6000',
		//	"Access-Control-Allow-Origin":"*",
			"Content-Length":contentLength,
			"Content-Type": mimeType,
			"Accept-Ranges":"bytes",
		};
	}
	
	router=( req,res )=>{
		var q = url.parse(req.url, true);
		var d = q.query;
	
		//TODO: Server Pages XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		if( q.pathname=="/" ){
			fs.readFile(`${this.front}/index.html`, (err,data)=>{
				if (err) {
					res.writeHead(404, this.header('text/html'));
					return res.end( this._404_() ); }
				res.writeHead(200, this.header('text/html'));
				res.end(data);
			});
			
		} else if( fs.existsSync(`${this.front}${q.pathname}.html`) ) {
			let data = fs.readFileSync(`${this.front}${q.pathname}.html`);
			res.writeHead(200, this.header('text/html')); 
			res.end(data);
			
		} else if( fs.existsSync(`${this.back}${q.pathname}.js`) ) {
			let data = fs.readFileSync(`${this.back}${q.pathname}.js`);
			eval(` try{ ${data} } catch(err) { console.log( err );
				res.writeHead(200, this.header('text/html'));
				res.end( 'something went wrong' );
			}`);
		}
	
		//TODO: Server Chunk XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		else{
			const keys = Object.keys(mimeType);
			for( var i in keys ){
				if( q.pathname.endsWith(keys[i]) ){
				
					const range = req.headers.range;
					const url = (`${this.front}${q.pathname}`).replace(/%20/g,' ');
			
					try{ 	
						if(range) {
							const chuck_size = Math.pow( 10,6 ); 
							const size = fs.statSync( url ).size;
							const start = Number(range.replace(/\D/g,""));
							const end = Math.min(chuck_size+start,size-1);

							res.writeHead(206, this.chunkheader( start,end,size,mimeType[keys[i]] ));
							const chuck = fs.createReadStream( url,{start,end} );
							chuck.pipe( res );	
						
						} else {
							if( fs.existsSync( url ) ){
								res.writeHead(200, this.header( mimeType[keys[i]] ));
								res.end( fs.readFileSync( url ) );
							}
						}	
					
					} catch(e) {
						res.writeHead(404, this.header('text/html'));
						res.end( this._404_() );
					}	return 0;		
				}
			}	
		
			res.writeHead(404, this.header('text/html'));
			res.end( this._404_() );
		}
	}
	
	startHttpServer=()=>{
		http.createServer( this.router ).listen( this.port,'0.0.0.0',()=>{
			console.log(`server started at http://localhost:${this.port}`);
		}); 
	}
		
	startHttpSecureServer=( key_path, cert_path )=>{
		let key = {
			key: fs.readFileSync('localhost-privkey.pem'),
			cert: fs.readFileSync('localhost-cert.pem')
		}
	
		https.createSecureServer( key, this.router ).listen( this.port,'0.0.0.0',()=>{
			console.log(`server started at https://localhost:${this.port}`);
		}); 
	}
	
	_404_=()=>{ 
		let url = `${this.front}/404.html`
		if( fs.existsSync(url) )
			return fs.readFileSync(`${this.front}/404.html`); 
		return 'Oops 404 not found';
	}
	
};	mollyJS = molly_class;

//TODO: Main Functions  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //
server = new mollyJS( 3000,'./www', './controller' );
server.startHttpServer();




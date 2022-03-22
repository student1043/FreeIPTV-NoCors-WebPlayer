//TODO: Libreries   XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //

const axios = require('axios');
const https = require('http2');
const http = require('http');
const url = require('url');
const fs = require('fs');

//TODO: String Normalization XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
const mimeType = {    

	//TODO: 3D Format Mimetype //
	"fbx" : "text/plain",
	"dae" : "text/plain",
	"mtl" : "text/plain",
	"obj" : "text/plain",
	"glb" : "text/plain",
	"gltf": "text/plain",
    
	//TODO: Font Mimetype //	
    "otf" : "font/otf",
    "ttf" : "font/ttf",
    "woff": "font/woff",
    "woff2": "font/woff2",
    
	//TODO: Audio Mimetype //
    "oga" : "audio/ogg",
    "aac" : "audio/aac",
    "wav" : "audio/wav",
    "mp3" : "audio/mpeg",
    "opus": "audio/opus",
    "weba": "audio/webm",
    
	//TODO: Video Mimetype //
    "ogv" : "video/ogg",
    "mp4" : "video/mp4",
    "ts"  : "video/mp2t",
    "webm": "video/webm",
    "mpeg": "video/mpeg",
    "avi" : "video/x-msvideo",
    
	//TODO: Text Mimetype //
    "css" : "text/css",
    "csv" : "text/csv",
    "html": "text/html",
    "text": "text/plain",
    "txt" : "text/plain",
    "ics" : "text/calendar",
    "js"  : "text/javascript",
    "xml" : "application/xhtml+xml",

	//TODO: Images Mimetype //
    "bmp" : "image/bmp",
    "gif" : "image/gif",
    "png" : "image/png",
    "jpg" : "image/jpeg",
    "jpeg": "image/jpeg",
    "webp": "image/webp",
    "svg" : "image/svg+xml",
    "ico" : "image/vnd.microsoft.icon",
    
	//TODO: Especial Mimetype //
    "zip" : "application/zip",
    "gz"  : "application/gzip",
	"sh"  : "application/x-sh",
    "json": "application/json",
    "tar" : "application/x-tar",
    "rar" : "application/vnd.rar",
    "7z"  : "application/x-7z-compressed",
    "m3u8": "application/vnd.apple.mpegurl",
    
	//TODO: Document Mimetype //    
    "pdf" : "application/pdf",	
    "doc" : "application/msword",
    "vsd" : "application/vnd.visio",
    "xls" : "application/vnd.ms-excel",
    "ppt" : "application/vnd.ms-powerpoint",
    "swf" : "application/x-shockwave-flash",
    "ods" : "application/vnd.oasis.opendocument.spreadsheet",	
    "odp" : "application/vnd.oasis.opendocument.presentation",	
    "odt" : "application/vnd.oasis.opendocument.presentation",	
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",	
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

//TODO: Main Class  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //

const mollyJS = function( Port, front_path, back_path ){
	const mollyJS = {
		port: process.env.PORT || Port,
		max_age: 1000 * 60 * 60 * 24,
		timeout: 1000 * 60 * 10,
		front: front_path,
		back: back_path,
	};
	
	mollyJS.slugify = function(str){ const map = {
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
	
	mollyJS.header = function( mimeType="text/plain",size=0 ){
		const header = {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': `max-age=${mollyJS.max_age}; preload`,
		//	'cache-control': `public, max-age=${mollyJS.max_age}`,
		//	'Access-Control-Allow-Origin':'*',
			'Content-Type':mimeType 
		};
		
		if( size ) header['Content-Length'] = size;
		return header;
	}

	mollyJS.chunkheader = function( start,end,size,mimeType="text/plain" ){
		const contentLength = end-start+1;
		return {
			'Content-Security-Policy-Reporn-Only': "default-src 'self'; font-src 'self'; img-src 'self'; frame-src 'self';",
			'Strict-Transport-Security': `max-age=${mollyJS.max_age}; preload`,
		//	'cache-control': `public, max-age=${mollyJS.max_age}`,
			"Content-Range":`bytes ${start}-${end}/${size}`,
		//	"Access-Control-Allow-Origin":"*",
			"Content-Length":contentLength,
			"Content-Type": mimeType,
			"Accept-Ranges":"bytes",
		};
	}
	
	mollyJS.router = function( req,res ){
		req.parse = url.parse(req.url, true);
		req.query = req.parse.query;
		
		//TODO: _main_ Function  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		try{
			let data = fs.readFileSync(`${mollyJS.back}/_main_.js`);
			eval( data.toString() );
		} catch(e) { }
	
		//TODO: Server Pages XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		if( req.parse.pathname=="/" ){
			fs.readFile(`${mollyJS.front}/index.html`, (err,data)=>{
				if (err) {
					res.writeHead(404, mollyJS.header('text/html'));
					return res.end( mollyJS._404_() ); }
				res.writeHead(200, mollyJS.header('text/html'));
				return res.end(data);
			});
			
		} else if( fs.existsSync(`${mollyJS.front}${req.parse.pathname}.html`) ) {
			let data = fs.readFileSync(`${mollyJS.front}${req.parse.pathname}.html`);
			res.writeHead(200, mollyJS.header('text/html')); 
			return res.end(data);
			
		} else if( fs.existsSync(`${mollyJS.back}${req.parse.pathname}.js`) ) {
			let data = fs.readFileSync(`${mollyJS.back}${req.parse.pathname}.js`);
			eval(` try{ ${data} } catch(err) { console.log( err );
				res.writeHead(200, mollyJS.header('text/html'));
				res.end('something went wrong'); 
			}`);return 0;
		}
	
		//TODO: Server Chunk XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX//
		else{
			const keys = Object.keys(mimeType);
			for( var i in keys ){
				if( req.parse.pathname.endsWith(keys[i]) ){
			
					try{	
					
						const url = (`${mollyJS.front}${req.parse.pathname}`);
						const size = fs.statSync( url ).size;
						const range = req.headers.range;
					
						if( !range ) { if( fs.existsSync( url ) ){
							res.writeHead(200, mollyJS.header( mimeType[keys[i]],size ));
							res.end( fs.readFileSync( url ) ); return 0;
						}} else { 
							const chuck_size = Math.pow( 10,6 ); 
							const start = Number(range.replace(/\D/g,""));
							const end = Math.min(chuck_size+start,size-1);
							const chuck = fs.createReadStream( url,{start,end} );

							res.writeHead(206, mollyJS.chunkheader( start,end,size,mimeType[keys[i]] ));
							chuck.pipe( res ); return 0;
						}
						
					} catch(e) {} return 0;
						
				}
			}
			
			res.writeHead(404, mollyJS.header('text/html'));
			res.end( mollyJS._404_() );	
		}
	}
	
	mollyJS.startHttpServer = function(){
		let server = http.createServer( mollyJS.router ).listen( mollyJS.port,'0.0.0.0',()=>{
			console.log(`server started at http://localhost:${mollyJS.port}`);
		}); server.setTimeout( mollyJS.timeout );	
	}
		
	mollyJS.startHttpSecureServer = function( key_path, cert_path ){
		let key = {
			key: fs.readFileSync('localhost-privkey.pem'),
			cert: fs.readFileSync('localhost-cert.pem')
		}
	
		let server = https.createSecureServer( key, mollyJS.router ).listen( mollyJS.port,'0.0.0.0',()=>{
			console.log(`server started at https://localhost:${mollyJS.port}`);
		}); server.setTimeout( mollyJS.timeout );		
	}
	
	mollyJS._404_ = function(){ 
		let url = `${mollyJS.front}/404.html`
		if( fs.existsSync(url) )
			return fs.readFileSync(`${mollyJS.front}/404.html`); 
		return 'Oops 404 not found';
	}
	
	return mollyJS;
};
	
//TODO: Main Functions  XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX XXX //
server = new mollyJS( 3000, './www', './controller' );
server.startHttpServer();




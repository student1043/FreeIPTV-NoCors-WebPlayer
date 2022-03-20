res.writeHead( 200, {'Content-Type':'text/html'} );

res.end( `,and this is my name is ${req.query.name}` );
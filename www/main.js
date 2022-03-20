$ = (...args)=>{ return document.querySelector(args) }

window.addEventListener( 'load',()=>{
	
	fetch( 'myname?name=enmanuel' )
	.then( async(response)=>{
		$('h1').innerHTML += await response.text();
	})
	.catch( e=>console.log(e) )
	
})
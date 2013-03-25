var expect = require('expect.js');


describe('Socket.IO: Connect', function(){

	it('should `connect` and `disconnect`', function(done){
	
		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.disconnect();
		});

		socket.on('disconnect', function(){
			done();
		});

		socket.on('connect_failed', function(){
			throw new Error('client failed to connect');
		});

		socket.on('error', function(){
			throw new Error('client error');
		});
	});

});

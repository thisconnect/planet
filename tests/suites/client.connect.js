exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Socket.IO: Connect', function(it){


	it('should `connect` and `disconnect`', function(expect){
		expect.perform(4);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			expect(spy.getErrorCount()).toBe(0);
			expect(spy.getCallCount()).toBe(0);
			spy();
			socket.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getErrorCount()).toBe(0);
			expect(spy.getCallCount()).toBe(1);
		});

		socket.on('connect_failed', function(){
			throw new Error('client failed to connect');
		});

		socket.on('error', function(){
			throw new Error('client error');
		});
	});


});

};

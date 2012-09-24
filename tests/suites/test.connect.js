exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Socket.IO: Connect', function(it){


	it('should `connect` and `disconnect`', function(expect){
		expect.perform(4);
		var spy = new Spy();

		var socket = io.connect('//:8999', {'force new connection': true});

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
	});


	it('should allow for simple `message`', function(expect){
		expect.perform(4);
		var spy = new Spy();

		var socket = io.connect('//:8999', {'force new connection': true});

		socket.on('connect', function(){
			spy();
			socket.send('simple message');
		});

		socket.on('message', function(data){
			expect(data).toBeType('string');
			expect(data).toBe('simple message');
			spy();
			socket.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getErrorCount()).toBe(0);
			expect(spy.getCallCount()).toBe(2);
		});
	});


});

};

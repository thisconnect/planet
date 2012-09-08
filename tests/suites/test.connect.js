exports.setup = function(Tests){


Tests.describe('Planet API: Connect', function(it){

	it('should send an `initial state` message after connect', function(expect){
		expect.perform(1);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('initial state', function(data){
			expect(data).toBeType('object');
			this.disconnect();
		});
	});

	it('should allow for simple `message`', function(expect){
		expect.perform(2);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('message', 'simple message');
		});

		socket.on('message', function(data){
			expect(data).toBeType('string');
			expect(data).toBe('simple message');
			this.disconnect();
		});
	});

});

};

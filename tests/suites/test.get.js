exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Get', function(it){

	it('should get a data dump at first connection', function(expect){
		expect.perform(5);
		var spy = new Spy()

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			expect(spy.getErrorCount()).toBe(0);
			expect(spy.getCallCount()).toBe(0);
			spy();
		});

		socket.on('get', function(data){
			expect(data).toBeType('object');
			expect(spy.getCallCount()).toBe(1);
			spy();
			this.disconnect();
		});

		socket.on('disconnect', function(data){
			expect(spy.getCallCount()).toBe(2);
		});
	});

	it('should `post` data at path in nested object', function(expect){
		expect.perform(5);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', { a: { b: { c: 123 } } });
		});

		first.on('put', function(data){
			first.emit('post', ['a', 'b', 'c'], 321);
		});

		first.on('post', function(key, value){
			this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data.a).toBeType('object');
				expect(data.a.b).toBeType('object');
				expect(data.a.b.c).toBeType('number');
				expect(data.a.b.c).toBe(321);
				this.disconnect();
			});
		});
	});

});

};

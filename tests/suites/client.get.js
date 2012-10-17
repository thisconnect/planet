exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Get', function(it){


	it('should `get` a dump of the current state after `connect`', function(expect){
		expect.perform(5);
		var spy = new Spy();

		var socket = io.connect('//:8999', {'force new connection': true});

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

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(2);
		});
	});


	it('should `get` the latest data', function(expect){
		expect.perform(5);

		var first = io.connect('//:8999', {'force new connection': true});

		first.on('connect', function(){
			first.emit('put', { a: { b: { c: 123 } } });
		});

		first.on('put', function(data){
			first.emit('post', ['a', 'b', 'c'], 321);
		});

		first.on('post', function(key, value){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': true});

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


	it('should `get` by key', function(expect){
		expect.perform(4);

		var first = io.connect('//:8999', {'force new connection': true});

		first.on('connect', function(){
			first.emit('put', { a: { b: { c: 0 } } });
		});

		first.on('put', function(data){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': true});

			second.emit('get', 'a', function(data){
				expect(data).toBeType('object');
				expect(data.b).toBeType('object');
				expect(data.b.c).toBeType('number');
				expect(data.b.c).toBe(0);
			});

			second.emit('get', 'b', function(data){
				expect(data).toBeNull();
				this.disconnect();
			});
		});
	});


});

};
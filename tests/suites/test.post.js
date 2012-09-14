exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Post', function(it){

	it('should allow for `post` messages', function(expect){
		expect.perform(4);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 'key-u', 123);
		});

		socket.on('post', function(key, value){
			expect(key).toBeType('string');
			expect(key).toBe('key-u');
			expect(value).toBeType('number');
			expect(value).toBe(123);
			this.disconnect();
		});
	});

	it('should `error` on corrupt `post` requests', function(expect){
		expect.perform(4);
		var spy = new Spy();

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 789); // missing key
			socket.emit('post', 'key-x'); // missing value
			socket.emit('post'); // or no data at all
		});

		socket.on('error', function(name, data){
			expect(name).toBe('post error');
			spy();
			if (spy.getCallCount() >= 3) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(3);
		});
	});

	it('should allow for `post` the same key', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', ['a', 'b', 'c'], 10);
			socket.emit('post', ['a', 'b', 'c'], 20);
			socket.emit('post', ['a', 'b', 'c'], 30);
		});

		socket.on('post', function(key, value){
			spy();
			expect(key).toBeType('array');
			expect(value).toBeType('number');
			expect(key.length).toBe(3);
			expect(key[0]).toBe('a');
			expect(key[1]).toBe('b');
			expect(key[2]).toBe('c');
			expect(value).toBe(10 * spy.getCallCount());
			if (3 <= spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(3);
		});
	});

});

};

exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Post', function(it){

	it('should allow for `post` messages', function(expect){
		expect.perform(3);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 'key-u', 123);
		});

		socket.on('post', function(data){
			expect(data).toBeType('object');
			expect(data.key).toBe('key-u');
			expect(data.value).toBe(123);
			this.disconnect();
		});
	});

	it('should `error` on corrupt `post` requests', function(expect){
		expect.perform(4);

		var spy = new Spy(),
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 789); // missing key
			socket.emit('post', 'key-x'); // missing value
			socket.emit('post'); // or no data at all
		});

		socket.on('error', function(name, data){
			expect(name).toBe('post error');
			spy();
			if (spy.getCallCount() > 3) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(4);
		});
	});

	it('should `post` data at path in nested object', function(expect){
		expect.perform(11);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'a': {
					'b': {
						'c': 123
					}
				}
			});
		});

		first.on('put', function(data){
			first.emit('post', ['a', 'b', 'c'], 321);
		});

		first.on('post', function(data){
			expect(data).toBeType('object');
			expect(data.path).toBeType('array');
			expect(data.path[0]).toBe('a');
			expect(data.path[1]).toBe('b');
			expect(data.path[2]).toBe('c');
			expect(data.value).toBe(321);
			this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('initial state', function(data){
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

exports.setup = function(Tests){

var channel = function(){
	return '/' + (+new Date);
};

var Spy = require('../testigo/Source/lib/spy').Spy;

Tests.describe('Planet API: Connection', function(it){

	it('should send an `initial state` message after connect', function(expect){
		expect.perform(1);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('initial state', function(data){
			expect(data).toBeType('object');
			this.disconnect();
		});
	});

	it('should allow for simple `message`', function(expect){
		expect.perform(1);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('message', 'simple message');
		});

		socket.on('message', function(data){
			expect(data).toBe('simple message');
			this.disconnect();
		});
	});

});

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

Tests.describe('Planet API: Put', function(it){

	it('should allow to put an object', function(expect){
		expect.perform(5);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 12,
				'key-b': 23
			});
		});

		socket.on('put', function(data){
			expect(data).toBeType('object');
			expect('key-a' in data).toBeTrue();
			expect('key-b' in data).toBeTrue();
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBe(23);
			this.disconnect();
		});
	});

	it('should put data to all connected clients', function(expect){
		expect.perform(10);

		var first = io.connect(null, {'force new connection': 1});

		first.on('put', function(data){
			expect(data).toBeType('object');
			expect('key-a' in data).toBeTrue();
			expect('key-b' in data).toBeTrue();
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBe(23);
			this.disconnect();
		});

		first.on('connect', function(){

			var second = io.connect(null, {'force new connection': 1});

			second.on('put', function(data){
				expect(data).toBeType('object');
				expect('key-a' in data).toBeTrue();
				expect('key-b' in data).toBeTrue();
				expect(data['key-a']).toBe(12);
				expect(data['key-b']).toBe(23);
				this.disconnect();
			});

			second.on('connect', function(){
				first.emit('put', {
					'key-a': 12,
					'key-b': 23
				});
			});
		});

	});

	it('should merge objects into planet', function(expect){
		expect.perform(4);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 12,
				'key-b': {
					'key-c': 34
				}
			});
			socket.emit('put', {
				'key-b': {
					'key-d': 56
				}
			});
			this.disconnect();
		});

		socket.on('disconnect', function(){

			var second = io.connect(null, {'force new connection': 1});

			second.on('initial state', function(data){
				expect(data).toBeType('object');
				expect(data['key-b']).toBeType('object');
				expect(data['key-b']['key-c']).toBe(34);
				expect(data['key-b']['key-d']).toBe(56);
				this.disconnect();
			});
		});
	});

});

Tests.describe('Planet API: Delete', function(it){

	it('should allow for delete object', function(expect){
		expect.perform(5);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-d': 5,
				'key-e': 6
			});
		});

		first.on('put', function(data){
			first.emit('delete', 'key-d');
		});

		first.on('delete', function(data){
			expect(data).toBe('key-d');
			this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('initial state', function(data){
				expect(data).toBeType('object');
				expect('key-d' in data).toBeFalse();
				expect('key-e' in data).toBeTrue();
				expect(data['key-e']).toBe(6);
				this.disconnect();
			});
		});
		
		// TODO: delete by path
		// TODO: delte null
	});

});

// TODO: implement get

};

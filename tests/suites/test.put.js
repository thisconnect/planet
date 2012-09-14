exports.setup = function(Tests){


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
			expect(data).toHaveProperty('key-a');
			expect(data).toHaveProperty('key-b');
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
			expect(data).toHaveProperty('key-a');
			expect(data).toHaveProperty('key-b');
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBe(23);
			this.disconnect();
		});

		first.on('connect', function(){

			var second = io.connect(null, {'force new connection': 1});

			second.on('put', function(data){
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data).toHaveProperty('key-b');
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

	it('should recursively merge objects into planet', function(expect){
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

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-b');
				expect(data['key-b']).toBeType('object');
				expect(data['key-b']['key-c']).toBe(34);
				expect(data['key-b']['key-d']).toBe(56);
				this.disconnect();
			});
		});
	});

});

};

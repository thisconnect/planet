exports.setup = function(Tests){


Tests.describe('Planet API: Delete', function(it){

	it('should delete by key (string)', function(expect){
		expect.perform(12);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false
			});
		});

		first.on('put', function(data){
			
			first.emit('delete', 'key-a');
			first.emit('delete', 'key-b');
			first.emit('delete', 'key-c');
			first.emit('delete', 'key-d');
			first.emit('delete', 'key-e');
			first.emit('delete', 'key-f');
			
			this.disconnect();
		});

		first.on('delete', function(key){
			expect(key).toMatch(/key-[a-f]/);
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data).not.toHaveProperty('key-a');
				expect(data).not.toHaveProperty('key-b');
				expect(data['key-c']).not.toBeNull();
				expect(data).not.toHaveProperty('key-d');
				expect(data['key-e']).not.toBeType('object');
				expect(data['key-f']).not.toBeType('boolean');
				this.disconnect();
			});
		});
	});

	it('should delete a nested object by path (array)', function(expect){
		expect.perform(10);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'veggies': null,
				'fruits': {
					'apples': 2,
					'oranges': 3
				}
			});
		});

		first.on('put', function(data){
			first.emit('delete', ['fruits', 'apples']);
		});

		first.on('delete', function(key){
			expect(key).toBeType('array');
			expect(key[0]).toBe('fruits');
			expect(key[1]).toBe('apples');
			this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data).toHaveProperty('veggies');
				expect(data).toHaveProperty('fruits');
				expect(data['fruits']).toBeType('object');
				expect('apples' in data['fruits']).toBeFalse();
				expect(data['fruits']).toHaveProperty('oranges');
				expect(data['fruits']['oranges']).toBe(3);
				this.disconnect();
			});
		});
		
		// TODO: delete null
	});

});

};

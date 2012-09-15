exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Delete', function(it){

	it('should delete by key (string)', function(expect){
		expect.perform(17);
		var spy = new Spy();

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
		});

		first.on('delete', function(key){
			spy();
			expect(key).toMatch(/key-[a-f]/);
			if (spy.getCallCount() == 6) this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(spy.getCallCount()).toBe(6);
				expect(data).toBeType('object');
				expect(data).not.toHaveProperty('key-a');
				expect(data).not.toHaveProperty('key-b');
				expect(data).not.toHaveProperty('key-c');
				expect(data['key-c']).not.toBeNull();
				expect(data).not.toHaveProperty('key-d');
				expect(data).not.toHaveProperty('key-e');
				expect(data['key-e']).not.toBeType('object');
				expect(data).not.toHaveProperty('key-f');
				expect(data['key-f']).not.toBeType('boolean');
				this.disconnect();
			});
		});
	});

	it('should delete a nested object by path (array)', function(expect){
		expect.perform(28);
		var spy = new Spy();

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-a': {
					'key-a': 12,
					'key-b': 'ok',
					'key-c': null,
					'key-d': [],
					'key-e': {},
					'key-f': false
				}
			});
		});

		first.on('put', function(data){
			first.emit('delete', ['key-a', 'key-a']);
			first.emit('delete', ['key-a', 'key-b']);
			first.emit('delete', ['key-a', 'key-c']);
			first.emit('delete', ['key-a', 'key-d']);
			first.emit('delete', ['key-a', 'key-e']);
			first.emit('delete', ['key-a', 'key-f']);
		});

		first.on('delete', function(key){
			spy();
			expect(key).toBeType('array');
			expect(key[0]).toBe('key-a');
			expect(key[1]).toMatch(/key-[a-f]/);
			if (spy.getCallCount() == 6) this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(spy.getCallCount()).toBe(6);
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data['key-a']).toBeType('object');
				expect(data['key-a']).not.toHaveProperty('key-a');
				expect(data['key-a']).not.toHaveProperty('key-b');
				expect(data['key-a']).not.toHaveProperty('key-c');
				expect(data['key-a']).not.toHaveProperty('key-d');
				expect(data['key-a']).not.toHaveProperty('key-e');
				expect(data['key-a']).not.toHaveProperty('key-f');
				this.disconnect();
			});
		});
		
		// TODO: delete null
	});

});

};

exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Put', function(it){

	it('should allow to put an object', function(expect){
		expect.perform(15);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false
			});
		});

		socket.on('put', function(data){
			expect(data).toBeType('object');
			expect(data).toHaveProperty('key-a');
			expect(data).toHaveProperty('key-b');
			expect(data).toHaveProperty('key-c');
			expect(data).toHaveProperty('key-d');
			expect(data).toHaveProperty('key-e');
			expect(data).toHaveProperty('key-f');
			expect(data['key-a']).toBeType('number');
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBeType('string');
			expect(data['key-b']).toBe('ok');
			expect(data['key-c']).toBeNull();
			expect(data['key-d']).toBeType('array');
			expect(data['key-e']).toBeType('object');
			expect(data['key-f']).toBeFalse();
			this.disconnect();
		});
	});

	it('should put data to all connected clients', function(expect){
		expect.perform(30);

		var first = io.connect(null, {'force new connection': 1});

		function puts(data){
			expect(data).toBeType('object');
			expect(data).toHaveProperty('key-a');
			expect(data).toHaveProperty('key-b');
			expect(data).toHaveProperty('key-c');
			expect(data).toHaveProperty('key-d');
			expect(data).toHaveProperty('key-e');
			expect(data).toHaveProperty('key-f');
			expect(data['key-a']).toBeType('number');
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBeType('string');
			expect(data['key-b']).toBe('ok');
			expect(data['key-c']).toBeNull();
			expect(data['key-d']).toBeType('array');
			expect(data['key-e']).toBeType('object');
			expect(data['key-f']).toBeFalse();
			this.disconnect();
		}

		first.on('put', puts);

		first.on('connect', function(){

			var second = io.connect(null, {'force new connection': 1});

			second.on('put', puts);

			second.on('connect', function(){
				first.emit('put', {
					'key-a': 12,
					'key-b': 'ok',
					'key-c': null,
					'key-d': [],
					'key-e': {},
					'key-f': false
				});
			});
		});

	});

	it('should recursively merge objects into planet', function(expect){
		expect.perform(28);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 1,
				'key-b': 'ok',
				'key-e': {
					'key-a': 2,
					'key-b': 'ok',
					'key-c': null,
					'key-d': [],
					'key-e': {}
				}
			});
			socket.emit('put', {
				'key-a': {
					'a': []
				},
				'key-c': null,
				'key-d': [],
				'key-e': {
					'key-a': null,
					'key-c': false,
					'key-d': {},
					'key-e': []
				}
			});
			socket.emit('put', {
				'key-e': {
					'key-f': 4
				},
				'key-f': 5
			});
			this.disconnect();
		});

		socket.on('disconnect', function(){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data).toHaveProperty('key-b');
				expect(data).toHaveProperty('key-c');
				expect(data).toHaveProperty('key-d');
				expect(data).toHaveProperty('key-e');
				expect(data).toHaveProperty('key-f');
				expect(data['key-a']).toBeType('object');
				expect(data['key-b']).toBeType('string');
				expect(data['key-c']).toBeNull();
				expect(data['key-d']).toBeType('array');
				expect(data['key-e']).toBeType('object');
				expect(data['key-f']).toBeType('number');
				expect(data['key-a']).toHaveProperty('a');
				expect(data['key-a']['a']).toBeType('array');
				expect(data['key-e']).toHaveProperty('key-a');
				expect(data['key-e']).toHaveProperty('key-b');
				expect(data['key-e']).toHaveProperty('key-c');
				expect(data['key-e']).toHaveProperty('key-d');
				expect(data['key-e']).toHaveProperty('key-e');
				expect(data['key-e']).toHaveProperty('key-f');
				expect(data['key-e']['key-a']).toBeNull();
				expect(data['key-e']['key-b']).toBe('ok');
				expect(data['key-e']['key-c']).toBeFalse();
				expect(data['key-e']['key-d']).toBeType('object');
				expect(data['key-e']['key-e']).toBeType('array');
				expect(data['key-e']['key-e'].length).toBe(0);
				expect(data['key-f']).toBe(5);
				this.disconnect();
			});
		});
	});

	it('should harminze strange keys', function(expect){
		expect.perform(13);

		var storage = {},
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'': 1,
				1: null,
				null: '',
				undefined: {},
				false: []
			});
			socket.emit('put', {
				'': 2,
				1: 'ok',
				null: null,
				undefined: [],
				false: {}
			});
		});

		socket.on('put', function(data){
			storage = data;
			if (data['1'] == 'ok') this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(storage).toBeType('object');
			expect(storage).toHaveProperty('');
			expect(storage).toHaveProperty('1');
			expect(storage).toHaveProperty('null');
			expect(storage).toHaveProperty('undefined');
			expect(storage).toHaveProperty('false');
			expect(storage['']).toBeType('number');
			expect(storage['']).toBe(2);
			expect(storage['1']).toBeType('string');
			expect(storage['1']).toBe('ok');
			expect(storage['null']).toBeNull();
			expect(storage['undefined']).toBeType('array');
			expect(storage['false']).toBeType('object');
		});
	});

	it('should error for putting invalid data', function(expect){
		expect.perform(21);
		var spy = new Spy();

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put');
			socket.emit('put', 12);
			socket.emit('put', '');
			socket.emit('put', null);
			socket.emit('put', []);
			socket.emit('put', {}); // doesnt error
			socket.emit('put', false);
			socket.emit('put', true);
			socket.emit('put', undefined);
			socket.emit('put', new Date);
			socket.emit('put', new String('lalala'));
		});

		socket.on('error', function(type, data){
			spy();
			expect(type).toBeType('string');
			expect(type).toBe('put');
			if (10 == spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(10);
		});
	});

});

};

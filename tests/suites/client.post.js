exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Post', function(it){


	it('should allow to post an object', function(expect){
		expect.perform(17);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false,
				'key-g': new Date
			});
		});

		socket.on('post', function(data){
			expect(data).toBeType('object');
			expect(data).toHaveProperty('key-a');
			expect(data).toHaveProperty('key-b');
			expect(data).toHaveProperty('key-c');
			expect(data).toHaveProperty('key-d');
			expect(data).toHaveProperty('key-e');
			expect(data).toHaveProperty('key-f');
			expect(data).toHaveProperty('key-g');
			expect(data['key-a']).toBeType('number');
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBeType('string');
			expect(data['key-b']).toBe('ok');
			expect(data['key-c']).toBeNull();
			expect(data['key-d']).toBeType('array');
			expect(data['key-e']).toBeType('object');
			expect(data['key-f']).toBeFalse();
			expect(data['key-g']).toBeType('string');
			this.disconnect();
		});
	});


	it('should allow reserved object properties and methods as key names', function(expect){
		expect.perform(41);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post', {
				'prototype': null,
				'create': null,
				'defineProperty': null,
				'defineProperties': null,
				'getOwnPropertyDescriptor': null,
				'keys': null,
				'getOwnPropertyNames': null,
				'getPrototypeOf': null,
				'preventExtensions': null,
				'isExtensible': null,
				'seal': null,
				'isSealed': null,
				'freeze': null,
				'isFrozen': null,
				'hasOwnProperty': null,
				'isPrototypeOf': null,
				'propertyIsEnumerable': null,
				'toLocaleString': null,
				'toString': null,
				'valueOf': null
			});
		});

		socket.on('post', function(data){
			expect(data).toBeType('object');
			expect(data).toHaveProperty('prototype');
			expect(data).toHaveProperty('create');
			expect(data).toHaveProperty('defineProperty');
			expect(data).toHaveProperty('defineProperties');
			expect(data).toHaveProperty('getOwnPropertyDescriptor');
			expect(data).toHaveProperty('keys');
			expect(data).toHaveProperty('getOwnPropertyNames');
			expect(data).toHaveProperty('getPrototypeOf');
			expect(data).toHaveProperty('preventExtensions');
			expect(data).toHaveProperty('isExtensible');
			expect(data).toHaveProperty('seal');
			expect(data).toHaveProperty('isSealed');
			expect(data).toHaveProperty('freeze');
			expect(data).toHaveProperty('isFrozen');
			expect(data).toHaveProperty('hasOwnProperty');
			expect(data).toHaveProperty('isPrototypeOf');
			expect(data).toHaveProperty('propertyIsEnumerable');
			expect(data).toHaveProperty('toLocaleString');
			expect(data).toHaveProperty('toString');
			expect(data).toHaveProperty('valueOf');

			expect(data['prototype']).toBeNull();
			expect(data['create']).toBeNull();
			expect(data['defineProperty']).toBeNull();
			expect(data['defineProperties']).toBeNull();
			expect(data['getOwnPropertyDescriptor']).toBeNull();
			expect(data['keys']).toBeNull();
			expect(data['getOwnPropertyNames']).toBeNull();
			expect(data['getPrototypeOf']).toBeNull();
			expect(data['preventExtensions']).toBeNull();
			expect(data['isExtensible']).toBeNull();
			expect(data['seal']).toBeNull();
			expect(data['isSealed']).toBeNull();
			expect(data['freeze']).toBeNull();
			expect(data['isFrozen']).toBeNull();
			expect(data['hasOwnProperty']).toBeNull();
			expect(data['isPrototypeOf']).toBeNull();
			expect(data['propertyIsEnumerable']).toBeNull();
			expect(data['toLocaleString']).toBeNull();
			expect(data['toString']).toBeNull();
			expect(data['valueOf']).toBeNull();

			this.disconnect();
		});
	});


	it('should post data to all connected clients', function(expect){
		expect.perform(30);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		function posts(data){
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

		first.on('post', posts);

		first.on('connect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('post', posts);

			second.on('connect', function(){
				first.emit('post', {
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

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post', {
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
			socket.emit('post', {
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
			socket.emit('post', {
				'key-e': {
					'key-f': 4
				},
				'key-f': 5
			});
			this.disconnect();
		});

		socket.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
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
			socket = io.connect('//:8004', {
				'force new connection': true
			});

		socket.on('connect', function(){
			socket.emit('post', {
				'': 1,
				1: null,
				null: '',
				undefined: {},
				false: []
			});
			socket.emit('post', {
				'': 2,
				1: 'ok',
				null: null,
				undefined: [],
				false: {}
			});
		});

		socket.on('post', function(data){
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


	it('should error for postting invalid data', function(expect){
		expect.perform(21);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post');
			socket.emit('post', 12);
			socket.emit('post', '');
			socket.emit('post', null);
			socket.emit('post', []);
			socket.emit('post', {}); // doesnt error
			socket.emit('post', false);
			socket.emit('post', true);
			socket.emit('post', undefined);
			socket.emit('post', new Date);
			socket.emit('post', new String('lalala'));
		});

		socket.on('error', function(type, data){
			spy();
			expect(type).toBeType('string');
			expect(type).toBe('post');
			if (10 == spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(10);
		});
	});


});

};

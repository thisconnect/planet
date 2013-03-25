var expect = require('expect.js');


describe('Planet Client API: Merge', function(){


	it('should allow to merge an object', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('merge', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false,
				'key-g': new Date
			});
		});

		socket.on('merge', function(data){
			expect(data).to.be.an('object');
			expect(data).to.have.property('key-a', 12);
			expect(data['key-a']).to.be.a('number');

			expect(data).to.have.property('key-b', 'ok');
			expect(data['key-b']).to.be.a('string');

			expect(data).to.have.property('key-c', null);

			expect(data).to.have.property('key-d');
			expect(data['key-d']).to.be.an('array');
			expect(data['key-d']).to.be.empty();

			expect(data).to.have.property('key-e');
			expect(data['key-e']).to.be.an('object');
			expect(data['key-e']).to.be.empty();
			expect(data).to.have.property('key-f', false);

			expect(data).to.have.property('key-g');
			expect(data['key-g']).to.be.a('string');

			this.disconnect();
			done();
		});
	});


	it('should allow reserved object properties and methods as key names', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.emit('merge', {
			'prototype': null, // true
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

		socket.on('merge', function(data){
			expect(data).to.be.an('object');
			expect(data).to.have.property('prototype', null);
			expect(data).to.have.property('create', null);
			expect(data).to.have.property('defineProperty', null);
			expect(data).to.have.property('defineProperties', null);
			expect(data).to.have.property('getOwnPropertyDescriptor', null);
			expect(data).to.have.property('keys', null);
			expect(data).to.have.property('getOwnPropertyNames', null);
			expect(data).to.have.property('getPrototypeOf', null);
			expect(data).to.have.property('preventExtensions', null);
			expect(data).to.have.property('isExtensible', null);
			expect(data).to.have.property('seal', null);
			expect(data).to.have.property('isSealed', null);
			expect(data).to.have.property('freeze', null);
			expect(data).to.have.property('isFrozen', null);
			expect(data).to.have.property('hasOwnProperty', null);
			expect(data).to.have.property('isPrototypeOf', null);
			expect(data).to.have.property('propertyIsEnumerable', null);
			expect(data).to.have.property('toLocaleString', null);
			expect(data).to.have.property('toString', null);
			expect(data).to.have.property('valueOf', null);

			this.disconnect();
			done();
		});
	});


	it('should send data to merge to all connected clients', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		function merges(data){
			expect(data).to.be.an('object');
			expect(data).to.have.property('key-a');
			expect(data).to.have.property('key-b');
			expect(data).to.have.property('key-c');
			expect(data).to.have.property('key-d');
			expect(data).to.have.property('key-e');
			expect(data).to.have.property('key-f');
			expect(data['key-a']).to.be.a('number');
			expect(data['key-a']).to.be(12);
			expect(data['key-b']).to.be.a('string');
			expect(data['key-b']).to.be('ok');
			expect(data['key-c']).to.be(null);
			expect(data['key-d']).to.be.an('array');
			expect(data['key-e']).to.be.an('object');
			expect(data['key-f']).to.be(false);
			this.disconnect();
		}

		first.on('merge', merges);

		first.on('connect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('merge', merges);

			second.on('connect', function(){
				first.emit('merge', {
					'key-a': 12,
					'key-b': 'ok',
					'key-c': null,
					'key-d': [],
					'key-e': {},
					'key-f': false
				});
				done();
			});
		});
	});


	it('should recursively merge objects into planet', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('merge', {
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
			socket.emit('merge', {
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
			socket.emit('merge', {
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
				expect(data).to.be.an('object');
				expect(data).to.have.property('key-a');
				expect(data).to.have.property('key-b');
				expect(data).to.have.property('key-c');
				expect(data).to.have.property('key-d');
				expect(data).to.have.property('key-e');
				expect(data).to.have.property('key-f');
				expect(data['key-a']).to.be.an('object');
				expect(data['key-b']).to.be.a('string');
				expect(data['key-c']).to.be(null);
				expect(data['key-d']).to.be.an('array');
				expect(data['key-e']).to.be.an('object');
				expect(data['key-f']).to.be.a('number');
				expect(data['key-a']).to.have.property('a');
				expect(data['key-a']['a']).to.be.an('array');
				expect(data['key-e']).to.have.property('key-a');
				expect(data['key-e']).to.have.property('key-b');
				expect(data['key-e']).to.have.property('key-c');
				expect(data['key-e']).to.have.property('key-d');
				expect(data['key-e']).to.have.property('key-e');
				expect(data['key-e']).to.have.property('key-f');
				expect(data['key-e']['key-a']).to.be(null);
				expect(data['key-e']['key-b']).to.be('ok');
				expect(data['key-e']['key-c']).to.be(false);
				expect(data['key-e']['key-d']).to.be.an('object');
				expect(data['key-e']['key-e']).to.be.an('array');
				expect(data['key-e']['key-e']).to.have.length(0);
				expect(data['key-f']).to.be(5);
				this.disconnect();
				done();
			});
		});
	});


	it('should harmoninze strange keys', function(done){

		var storage = {},
			socket = io.connect('//:8004', {
				'force new connection': true
			});

		socket.on('connect', function(){
			socket.emit('merge', {
				'': 1,
				1: null,
				null: '',
				undefined: {},
				false: []
			});
			socket.emit('merge', {
				'': 2,
				1: 'ok',
				null: null,
				undefined: [],
				false: {}
			});
		});

		socket.on('merge', function(data){
			storage = data;
			if (data['1'] == 'ok') this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(storage).to.be.an('object');
			expect(storage).to.have.property('');
			expect(storage).to.have.property('1');
			expect(storage).to.have.property('null');
			expect(storage).to.have.property('undefined');
			expect(storage).to.have.property('false');
			expect(storage['']).to.be.a('number');
			expect(storage['']).to.be(2);
			expect(storage['1']).to.be.a('string');
			expect(storage['1']).to.be('ok');
			expect(storage['null']).to.be(null);
			expect(storage['undefined']).to.be.an('array');
			expect(storage['false']).to.be.an('object');
			done();
		});
	});


	it('should error for merging invalid data', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('merge');
			socket.emit('merge', 12);
			socket.emit('merge', '');
			socket.emit('merge', null);
			socket.emit('merge', []);
			socket.emit('merge', {}); // doesnt error
			socket.emit('merge', false);
			socket.emit('merge', true);
			socket.emit('merge', undefined);
			socket.emit('merge', new Date);
			socket.emit('merge', new String('lalala'));
			socket.disconnect();
		});

		socket.on('merge', function(data){
			// TODO: throw new Error('shouldnt merge');
		});

		socket.on('error', function(type){
			expect(type).to.be.a('string');
		});

		socket.on('disconnect', function(){
			done();
		});
	});


});

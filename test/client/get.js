var expect = require('expect.js');


describe('Planet Client API: Get', function(){


	it('should `get` the current state', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){

			socket.emit('delete');
			socket.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).to.be.empty();
				socket.disconnect();
			});
		});

		socket.on('disconnect', function(){
			done();
		});
	});


	it('should `get` the latest data', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {a: {b: {c: 123}}});
		});

		first.on('merge', function(data){
			first.emit('set', ['a', 'b', 'c'], 321);
		});

		first.on('set', function(key, value){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data.a).to.be.an('object');
				expect(data.a.b).to.be.an('object');
				expect(data.a.b.c).to.be.a('number');
				expect(data.a.b.c).to.be(321);
				this.disconnect();
				done();
			});
		});
	});


	it('should emit `get` search a value by key', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {a: {b: {c: 0}}});
		});

		first.on('merge', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('error', function(){
				throw new Error('client error');
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data.a).to.be.an('object');
				expect(data.a.b).to.be.an('object');
				expect(data.a.b.c).to.be.a('number');
				expect(data.a.b.c).to.be(0);
			});

			second.emit('get', 'a', function(data){
				expect(data).to.be.an('object');
				expect(data.b).to.be.an('object');
				expect(data.b.c).to.be.an('number');
				expect(data.b.c).to.be(0);
			});

			second.emit('get', ['a', 'b'], function(data){
				expect(data).to.be.an('object');
				expect(data.c).to.be.a('number');
				expect(data.c).to.be(0);
			});

			second.emit('get', ['a', 'b', 'c'], function(data){
				expect(data).to.be(0);
				second.disconnect();
				done();
			});
		});
	});


	it('should return null for nonexistent or invalid keys', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {a: {b: {c: 0}}});
		});

		first.on('merge', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('error', function(){
				throw new Error('client error');
			});

			second.emit('get', 'd', function(data){
				expect(data).to.be(null);
			});

			second.emit('get', 1, function(data){
				expect(data).to.be(null);
			});

			second.emit('get', [null], function(data){
				expect(data).to.be(null);
			});

			second.emit('get', ['no', 'key', 'here'], function(data){
				expect(data).to.be(null);
			});

			second.emit('get', new Date(), function(data){
				expect(data).to.be(null);
				second.disconnect();
				done();
			});
		});
	});


	it('should error on invalid keys', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {a: {b: {c: 0}}});
		});

		first.on('merge', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('error', function(error){
				expect(error).to.be.a('string');
			});

			function get(){
				throw new Error('shouldnt get here!');
			}
			second.emit('get', null, get);
			second.emit('get', undefined, get);
			second.emit('get', [], get);
			second.emit('get', {}, get);
			second.emit('set', 'done', 'uh u');

			second.on('set', function(key, value){
				if (key == 'done') second.disconnect();
			});
			second.on('disconnect', function(){
				done();
			});
		});
	});



	it('should get reserved property and method names as keys', function(done){

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

		socket.emit('get', function(data){
			expect(data).to.be.an('object');
			expect(data).to.have.property('prototype');
			expect(data['prototype']).to.be(null);

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

});

var expect = require('expect.js');


describe('Planet Client API: Remove', function(){


	it('should remove by key (string)', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false
			});
		});

		first.on('merge', function(data){
			first.emit('remove', 'key-a');
			first.emit('remove', 'key-b');
			first.emit('remove', 'key-c');
			first.emit('remove', 'key-d');
			first.emit('remove', 'key-e');
			first.emit('remove', 'key-f');
		});

		first.on('remove', function(key){
			expect(key).to.match(/key-[a-f]/);
			if (key == 'key-f') first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).not.to.have.property('key-a');
				expect(data).not.to.have.property('key-b');
				expect(data).not.to.have.property('key-c');
				expect(data['key-c']).not.to.be(null);
				expect(data).not.to.have.property('key-d');
				expect(data).not.to.have.property('key-e');
				expect(data['key-e']).not.to.be.an('object');
				expect(data).not.to.have.property('key-f');
				expect(data['key-f']).not.to.be.a('boolean');
				second.disconnect();
				done();
			});
		});
	});


	it('should remove a nested object by path (array)', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {
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

		first.on('merge', function(data){
			first.emit('remove', ['key-a', 'key-a']);
			first.emit('remove', ['key-a', 'key-b']);
			first.emit('remove', ['key-a', 'key-c']);
			first.emit('remove', ['key-a', 'key-d']);
			first.emit('remove', ['key-a', 'key-e']);
			first.emit('remove', ['key-a', 'key-f']);
		});

		first.on('remove', function(key){
			expect(key).to.be.an('array');
			expect(key[0]).to.be('key-a');
			expect(key[1]).to.match(/key-[a-f]/);
			if (key[1] == 'key-f') first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).to.have.property('key-a');
				expect(data['key-a']).to.be.an('object');
				expect(data['key-a']).not.to.have.property('key-a');
				expect(data['key-a']).not.to.have.property('key-b');
				expect(data['key-a']).not.to.have.property('key-c');
				expect(data['key-a']).not.to.have.property('key-d');
				expect(data['key-a']).not.to.have.property('key-e');
				expect(data['key-a']).not.to.have.property('key-f');
				second.disconnect();
				done();
			});
		});
	});


	it('should error when removing nonexistent keys', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('merge', {
				'key-a': {
					'key-a': 1
				}
			});
		});

		first.on('merge', function(data){
			first.emit('remove', 'key-b');
			first.emit('remove', ['key-b']);
			first.emit('remove', ['key-a', 'key-b']);
			console.log('\TODO move this test to Error!');
			// first.emit('remove', ['key-a', 'key-a', 'key-x']); // Error!
			first.disconnect();
		});

		first.on('error', function(type){
			expect(type).to.be.a('string');
		});

		first.on('remove', function(){
			// TODO: throw new Error('shouldnt emit remove!');
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).to.have.property('key-a');
				expect(data['key-a']).to.be.an('object');
				expect(data['key-a']).to.have.property('key-a');
				expect(data['key-a']).not.to.have.property('key-b');
				expect(Object.keys(data)).to.have.length(1);
				second.disconnect();
				done();
			});
		});
	});


	it('should allow `remove` reserved properties and method names', function(done){

		var props = {
			'prototype': true,
			'isArray': true,
			'length': true,
			'pop': true,
			'push': true,
			'reverse': true,
			'shift': true,
			'sort': true,
			'splice': true,
			'unshift': true,
			'concat': true,
			'join': true,
			'slice': true,
			'toString': true,
			'indexOf': true,
			'lastIndexOf': true,
			'filter': true,
			'forEach': true,
			'every': true,
			'map': true,
			'some': true,
			'reduce': true,
			'reduceRight': true
		};

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('delete');
			socket.emit('merge', props);
		});

		socket.on('remove', function(key){
			delete props[key];
		});

		socket.on('merge', function(data){
			for (var key in props){
				socket.emit('remove', key);
			}
			socket.emit('get', function(data){
				expect(data).to.be.empty();
				expect(props).to.be.empty();
				socket.disconnect();
				done();
			});
		});

	});


	it('should not allow removing invalid keys', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('merge', {
				'key-a': 1,
				'key-b': [0, 1, 2, 3, 4]
			});
		});

		first.on('merge', function(data){
			first.emit('remove', 12);
			first.emit('remove', null);
			first.emit('remove', true);
			first.emit('remove', false);
			first.emit('remove', []);
			first.emit('remove', [null, false, {}]);
			first.emit('remove', ['key-b', 2]); // array not yet supported
			first.emit('remove', {});
			first.disconnect();

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).to.have.property('key-a');
				expect(data['key-a']).to.be.a('number');
				expect(data['key-a']).to.be(1);
				expect(data['key-b']).to.be.an('array');
				expect(data['key-b'][2]).to.be(2);
				expect(Object.keys(data)).to.have.length(2);
				second.disconnect();
				done();
			});
		});

		first.on('error', function(type, key){
			expect(type).to.be.a('string');
		});

	});

});

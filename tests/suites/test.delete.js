exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Delete', function(it){


	it('should delete by key (string)', function(expect){
		expect.perform(17);
		var spy = new Spy();

		var first = io.connect('//:8999', {'force new connection': 1});

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

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': 1});

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

		var first = io.connect('//:8999', {'force new connection': 1});

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

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': 1});

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
	});


	it('should delete everything', function(expect){
		expect.perform(4);

		var first = io.connect('//:8999', {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-a': null,
				'key-b': ''
			});
		});

		first.on('put', function(data){
			first.emit('delete');
		});

		first.on('delete', function(key){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect(data).not.toHaveProperty('key-a');
				expect(data).not.toHaveProperty('key-b');
				expect(Object.keys(data).length).toBe(0);
				this.disconnect();
			});
		});
	});


	it('should error when deleting nonexistent keys', function(expect){
		expect.perform(7);
		var spy = new Spy();

		var first = io.connect('//:8999', {'force new connection': 1});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('put', {
				'key-a': {
					'key-a': 1
				}
			});
		});

		first.on('put', function(data){
			first.emit('delete', 'key-b');
			first.emit('delete', ['key-a', 'key-b']);
			first.emit('delete', ['key-v']);
		});

		first.on('error', function(type, key){
			spy();
			if (spy.getCallCount() == 3) this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': 1});

			second.on('get', function(data){
				expect(spy.getCallCount()).toBe(3);
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data['key-a']).toBeType('object');
				expect(data['key-a']).toHaveProperty('key-a');
				expect(data['key-a']).not.toHaveProperty('key-b');
				expect(Object.keys(data).length).toBe(1);
				this.disconnect();
			});
		});
	});


	it('should allow `delete` reserved object props and methods as key names', function(expect){
		expect.perform(2);
		var spy = new Spy();

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

		var socket = io.connect('//:8999', {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', props);
		});

		socket.on('put', function(data){
			for (var key in props){
				socket.emit('delete', key);
			}
		});

		socket.on('delete', function(key){
			delete props[key];
			spy();
			if (spy.getCallCount() == 23) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(23);
			expect(Object.keys(props).length).toBe(0);
		});
	});


	it('should not allow invalid keys', function(expect){
		expect.perform(6);
		var spy = new Spy();

		var first = io.connect('//:8999', {'force new connection': 1});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('put', {
				'key-a': 1
			});
		});

		first.on('put', function(data){
			first.emit('delete', 12);
			first.emit('delete', null);
			first.emit('delete', true);
			first.emit('delete', false);
			first.emit('delete', []);
			first.emit('delete', [null, false, {}]);
			first.emit('delete', {});
		});

		first.on('error', function(type, key){
			spy();
			if (spy.getCallCount() == 7) this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': 1});

			second.on('get', function(data){
				expect(spy.getCallCount()).toBe(7);
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data['key-a']).toBeType('number');
				expect(data['key-a']).toBe(1);
				expect(Object.keys(data).length).toBe(1);
				this.disconnect();
			});
		});
	});


});

};

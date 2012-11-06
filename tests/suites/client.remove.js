exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Remove', function(it){


	it('should remove by key (string)', function(expect){
		expect.perform(17);
		var spy = new Spy();

		var first = io.connect('//:8999', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {
				'key-a': 12,
				'key-b': 'ok',
				'key-c': null,
				'key-d': [],
				'key-e': {},
				'key-f': false
			});
		});

		first.on('post', function(data){
			first.emit('remove', 'key-a');
			first.emit('remove', 'key-b');
			first.emit('remove', 'key-c');
			first.emit('remove', 'key-d');
			first.emit('remove', 'key-e');
			first.emit('remove', 'key-f');
		});

		first.on('remove', function(key){
			spy();
			expect(key).toMatch(/key-[a-f]/);
			if (spy.getCallCount() == 6) first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {
				'force new connection': true
			});

			second.emit('get', function(data){
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
				second.disconnect();
			});
		});
	});


	it('should remove a nested object by path (array)', function(expect){
		expect.perform(28);
		var spy = new Spy();

		var first = io.connect('//:8999', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {
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

		first.on('post', function(data){
			first.emit('remove', ['key-a', 'key-a']);
			first.emit('remove', ['key-a', 'key-b']);
			first.emit('remove', ['key-a', 'key-c']);
			first.emit('remove', ['key-a', 'key-d']);
			first.emit('remove', ['key-a', 'key-e']);
			first.emit('remove', ['key-a', 'key-f']);
		});

		first.on('remove', function(key){
			spy();
			expect(key).toBeType('array');
			expect(key[0]).toBe('key-a');
			expect(key[1]).toMatch(/key-[a-f]/);
			if (spy.getCallCount() == 6) first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {
				'force new connection': true
			});

			second.emit('get', function(data){
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
				second.disconnect();
			});
		});
	});


	it('should error when removing nonexistent keys', function(expect){
		expect.perform(7);
		var spy = new Spy();

		var first = io.connect('//:8999', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('post', {
				'key-a': {
					'key-a': 1
				}
			});
		});

		first.on('post', function(data){
			first.emit('remove', 'key-b');
			first.emit('remove', ['key-b']);
			first.emit('remove', ['key-a', 'key-b']);
		});

		first.on('error', function(type, key){
			spy();
			if (spy.getCallCount() == 3) first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(spy.getCallCount()).toBe(3);
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data['key-a']).toBeType('object');
				expect(data['key-a']).toHaveProperty('key-a');
				expect(data['key-a']).not.toHaveProperty('key-b');
				expect(Object.keys(data).length).toBe(1);
				second.disconnect();
			});
		});
	});


	it('should allow `remove` reserved properties and method names', function(expect){
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

		var socket = io.connect('//:8999', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post', props);
		});

		socket.on('post', function(data){
			for (var key in props){
				socket.emit('remove', key);
			}
		});

		socket.on('remove', function(key){
			delete props[key];
			spy();
			if (spy.getCallCount() == 23) socket.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(23);
			expect(Object.keys(props).length).toBe(0);
		});
	});


	it('should not allow removing invalid keys', function(expect){
		expect.perform(6);
		var spy = new Spy();

		var first = io.connect('//:8999', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('delete');
			first.emit('post', {
				'key-a': 1
			});
		});

		first.on('post', function(data){
			first.emit('remove', 12);
			first.emit('remove', null);
			first.emit('remove', true);
			first.emit('remove', false);
			first.emit('remove', []);
			first.emit('remove', [null, false, {}]);
			first.emit('remove', {});
		});

		first.on('error', function(type, key){
			spy();
			if (spy.getCallCount() == 7) first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(spy.getCallCount()).toBe(7);
				expect(data).toBeType('object');
				expect(data).toHaveProperty('key-a');
				expect(data['key-a']).toBeType('number');
				expect(data['key-a']).toBe(1);
				expect(Object.keys(data).length).toBe(1);
				second.disconnect();
			});
		});
	});


});

};

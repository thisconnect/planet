exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Post', function(it){


	it('should allow for `post` key value pairs', function(expect){
		expect.perform(4);

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 'key-u', 123);
		});

		socket.on('post', function(key, value){
			expect(key).toBeType('string');
			expect(key).toBe('key-u');
			expect(value).toBeType('number');
			expect(value).toBe(123);
			this.disconnect();
		});
	});


	it('should `post` values with all possible types', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var container = {},
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 'key-a', 12);
			socket.emit('post', 'key-b', '');
			socket.emit('post', 'key-c', null);
			socket.emit('post', 'key-d', []);
			socket.emit('post', 'key-e', {});
			socket.emit('post', 'key-f', false);
		});

		socket.on('post', function(key, value){
			spy();
			expect(key).toBeType('string');
			container[key] = value;
			if (6 == spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(6);
			expect(container).toHaveProperty('key-a');
			expect(container).toHaveProperty('key-b');
			expect(container).toHaveProperty('key-c');
			expect(container).toHaveProperty('key-d');
			expect(container).toHaveProperty('key-e');
			expect(container).toHaveProperty('key-f');
			expect(container['key-a']).toBeType('number');
			expect(container['key-b']).toBeType('string');
			expect(container['key-c']).toBeNull();
			expect(container['key-d']).toBeType('array');
			expect(container['key-e']).toBeType('object');
			expect(container['key-f']).toBeType('boolean');
			expect(container['key-a']).toBe(12);
			expect(container['key-b']).toBe('');
			expect(container['key-f']).toBeFalse();
		});
	});


	it('should allow for `post` the same key', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', ['a', 'b', 'c'], 10);
			socket.emit('post', ['a', 'b', 'c'], 20);
			socket.emit('post', 'a.b.c'.split('.'), 30);
		});

		socket.on('post', function(key, value){
			spy();
			expect(key).toBeType('array');
			expect(value).toBeType('number');
			expect(key.length).toBe(3);
			expect(key[0]).toBe('a');
			expect(key[1]).toBe('b');
			expect(key[2]).toBe('c');
			expect(value).toBe(10 * spy.getCallCount());
			if (3 <= spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(3);
		});
	});


	it('should allow `post` with reserved object props and methods as key names', function(expect){
		expect.perform(47);
		var spy = new Spy();

		var arrayProtos = ['prototype', 'isArray', 'length', 'pop',
			'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
			'concat', 'join', 'slice', 'toString', 'indexOf', 'lastIndexOf',
			'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'];

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			arrayProtos.forEach(function(item){
				socket.emit('post', item, false);
			});
		});

		var indexOf = Array.prototype.indexOf;
		socket.on('post', function(key, value){
			spy();
			expect(indexOf.call(arrayProtos, key)).not.toBe(-1);
			expect(value).toBeFalse();
			if (spy.getCallCount() >= 23) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(23);
		});
	});


	it('should `error` on corrupt `post` messages', function(expect){
		expect.perform(15);
		var spy = new Spy();

		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('post', 789);
			socket.emit('post', 0, 0);
			socket.emit('post', false, 1);
			socket.emit('post', [], 2);
			socket.emit('post', {}, 3);
			socket.emit('post', null, 4);
			socket.emit('post', undefined, 5);
			socket.emit('post', 'key-x'); // missing value
			socket.emit('post', false);
			socket.emit('post', []);
			socket.emit('post', {});
			socket.emit('post', null);
			socket.emit('post', undefined);
			socket.emit('post'); // or no data at all

			// invalid path keys are ignored silently
			socket.emit('post', [1], 1);
			socket.emit('post', [false], 2);
			socket.emit('post', [[]], 3);
			socket.emit('post', [{}], 4);
			socket.emit('post', [null], 5);
			socket.emit('post', [undefined], 6);
			socket.emit('post', ['a', 1], 1);
			socket.emit('post', ['a', false], 2);
			socket.emit('post', ['a', []], 3);
			socket.emit('post', ['a', {}], 4);
			socket.emit('post', ['a', null], 5);
			socket.emit('post', ['a', undefined], 6);
		});

		socket.on('error', function(type, key, value){
			expect(type).toBe('post');
			spy();
			if (spy.getCallCount() >= 14) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(14);
		});
	});


});

};

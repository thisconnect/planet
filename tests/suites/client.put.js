exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Put', function(it){


	it('should allow for `put` key value pairs', function(expect){
		expect.perform(4);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('put', 'key-u', 123);
		});

		socket.on('put', function(key, value){
			expect(key).toBeType('string');
			expect(key).toBe('key-u');
			expect(value).toBeType('number');
			expect(value).toBe(123);
			this.disconnect();
		});
	});


	it('should `put` values with all possible types', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var container = {},
			socket = io.connect('//:8004', {
				'force new connection': true
			});

		socket.on('connect', function(){
			socket.emit('put', 'key-a', 12);
			socket.emit('put', 'key-b', '');
			socket.emit('put', 'key-c', null);
			socket.emit('put', 'key-d', []);
			socket.emit('put', 'key-e', {});
			socket.emit('put', 'key-f', false);
			socket.emit('put', 'key-g', new Date());
		});

		socket.on('put', function(key, value){
			spy();
			expect(key).toBeType('string');
			container[key] = value;
			if (7 == spy.getCallCount()) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(7);
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
			expect(container['key-g']).toBeType('string');
		});
	});


	it('should allow for `put` the same key', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('put', ['a', 'b', 'c'], 10);
			socket.emit('put', ['a', 'b', 'c'], 20);
			socket.emit('put', 'a.b.c'.split('.'), 30);
		});

		socket.on('put', function(key, value){
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


	it('should allow `put` with reserved object props and methods as key names', function(expect){
		expect.perform(47);
		var spy = new Spy();

		var arrayProtos = ['prototype', 'isArray', 'length', 'pop',
			'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
			'concat', 'join', 'slice', 'toString', 'indexOf', 'lastIndexOf',
			'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'];

		var socket = io.connect('//:8004', {'force new connection': true});

		socket.on('connect', function(){
			arrayProtos.forEach(function(item){
				socket.emit('put', item, false);
			});
		});

		var indexOf = Array.prototype.indexOf;
		socket.on('put', function(key, value){
			spy();
			expect(indexOf.call(arrayProtos, key)).not.toBe(-1);
			expect(value).toBeFalse();
			if (spy.getCallCount() >= 23) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(23);
		});
	});


	it('should `error` on corrupt `put` messages', function(expect){
		expect.perform(15);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('put', 789);
			socket.emit('put', 0, 0);
			socket.emit('put', false, 1);
			socket.emit('put', [], 2);
			socket.emit('put', {}, 3);
			socket.emit('put', null, 4);
			socket.emit('put', undefined, 5);
			socket.emit('put', 'key-x'); // missing value
			socket.emit('put', false);
			socket.emit('put', []);
			socket.emit('put', {});
			socket.emit('put', null);
			socket.emit('put', undefined);
			socket.emit('put'); // or no data at all

			// invalid path keys are ignored silently
			socket.emit('put', [1], 1);
			socket.emit('put', [false], 2);
			socket.emit('put', [[]], 3);
			socket.emit('put', [{}], 4);
			socket.emit('put', [null], 5);
			socket.emit('put', [undefined], 6);
			socket.emit('put', ['a', 1], 1);
			socket.emit('put', ['a', false], 2);
			socket.emit('put', ['a', []], 3);
			socket.emit('put', ['a', {}], 4);
			socket.emit('put', ['a', null], 5);
			socket.emit('put', ['a', undefined], 6);
		});

		socket.on('error', function(type, key, value){
			expect(type).toBe('put');
			spy();
			if (spy.getCallCount() >= 14) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(14);
		});
	});


});

};

exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet Client API: Set', function(it){


	it('should allow for `set` key value pairs', function(expect){
		expect.perform(4);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('set', 'key-u', 123);
		});

		socket.on('set', function(key, value){
			expect(key).toBeType('string');
			expect(key).toBe('key-u');
			expect(value).toBeType('number');
			expect(value).toBe(123);
			this.disconnect();
		});
	});


	it('should `set` values with all possible types', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var container = {},
			socket = io.connect('//:8004', {
				'force new connection': true
			});

		socket.on('connect', function(){
			socket.emit('set', 'key-a', 12);
			socket.emit('set', 'key-b', '');
			socket.emit('set', 'key-c', null);
			socket.emit('set', 'key-d', []);
			socket.emit('set', 'key-e', {});
			socket.emit('set', 'key-f', false);
			socket.emit('set', 'key-g', new Date());
		});

		socket.on('set', function(key, value){
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


	it('should allow for `set` the same key', function(expect){
		expect.perform(22);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('set', ['a', 'b', 'c'], 10);
			socket.emit('set', ['a', 'b', 'c'], 20);
			socket.emit('set', 'a.b.c'.split('.'), 30);
		});

		socket.on('set', function(key, value){
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


	it('should allow `set` with reserved object props and methods as key names', function(expect){
		expect.perform(47);
		var spy = new Spy();

		var arrayProtos = ['prototype', 'isArray', 'length', 'pop',
			'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
			'concat', 'join', 'slice', 'toString', 'indexOf', 'lastIndexOf',
			'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'];

		var socket = io.connect('//:8004', {'force new connection': true});

		socket.on('connect', function(){
			arrayProtos.forEach(function(item){
				socket.emit('set', item, false);
			});
		});

		var indexOf = Array.prototype.indexOf;
		socket.on('set', function(key, value){
			spy();
			expect(indexOf.call(arrayProtos, key)).not.toBe(-1);
			expect(value).toBeFalse();
			if (spy.getCallCount() >= 23) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(23);
		});
	});


	it('should `error` on corrupt `set` keys', function(expect){
		expect.perform(15);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('set', 789);
			socket.emit('set', 0, 0);
			socket.emit('set', false, 1);
			socket.emit('set', [], 2);
			socket.emit('set', {}, 3);
			socket.emit('set', null, 4);
			socket.emit('set', undefined, 5);
			socket.emit('set', 'key-x'); // missing value
			socket.emit('set', false);
			socket.emit('set', []);
			socket.emit('set', {});
			socket.emit('set', null);
			socket.emit('set', undefined);
			socket.emit('set'); // or no data at all

			// invalid path keys are ignored silently
			socket.emit('set', [1], 1);
			socket.emit('set', [false], 2);
			socket.emit('set', [[]], 3);
			socket.emit('set', [{}], 4);
			socket.emit('set', [null], 5);
			socket.emit('set', [undefined], 6);
			socket.emit('set', ['a', 1], 1);
			socket.emit('set', ['a', false], 2);
			socket.emit('set', ['a', []], 3);
			socket.emit('set', ['a', {}], 4);
			socket.emit('set', ['a', null], 5);
			socket.emit('set', ['a', undefined], 6);
		});

		socket.on('error', function(type, key, value){
			expect(type).toBe('set');
			spy();
			if (spy.getCallCount() >= 14) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(14);
		});
	});


});

};

var expect = require('expect.js');


describe('Planet Client API: Set', function(){


	it('should allow for `set` key value pairs', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('set', 'key-u', 123);
		});

		socket.on('set', function(key, value){
			expect(key).to.be.a('string');
			expect(key).to.be('key-u');
			expect(value).to.be.a('number');
			expect(value).to.be(123);
			this.disconnect();
			done();
		});
	});


	it('should `set` values with all possible types', function(done){

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
			expect(key).to.be.a('string');
			container[key] = value;
			if (key == 'key-g') socket.disconnect();
		});

		socket.on('disconnect', function(){

			expect(container['key-a']).to.be.a('number');
			expect(container).to.have.property('key-a', 12);

			expect(container['key-b']).to.be.a('string');
			expect(container).to.have.property('key-b', '');

			expect(container['key-c']).to.be(null);
			expect(container).to.have.property('key-c', null);

			expect(container['key-d']).to.be.an('array');
			expect(container).to.have.property('key-d');
			expect(container['key-d']).to.be.empty();

			expect(container['key-e']).to.be.an('object');
			expect(container).to.have.property('key-e');

			expect(container['key-f']).to.be.a('boolean');
			expect(container).to.have.property('key-f', false);

			expect(container['key-g']).to.be.a('string');

			done();

		});
	});


	it('should allow for `set` the same key', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('set', ['a', 'b', 'c'], 10);
			socket.emit('set', ['a', 'b', 'c'], 20);
			socket.emit('set', 'a.b.c'.split('.'), 30);
		});

		socket.on('set', function(key, value){

			expect(key).to.be.an('array');
			expect(value).to.be.a('number');
			expect(key.length).to.be(3);
			expect(key[0]).to.be('a');
			expect(key[1]).to.be('b');
			expect(key[2]).to.be('c');
			expect(value).to.be.within(10, 30);
			if (value == 30) this.disconnect();
		});

		socket.on('disconnect', function(){
			done();
		});
	});


	it('should allow `set` with reserved object props and methods as key names', function(done){

		var arrayProtos = ['prototype', 'isArray', 'length', 'pop',
			'push', 'reverse', 'shift', 'sort', 'splice', 'unshift',
			'concat', 'join', 'slice', 'toString', 'indexOf', 'lastIndexOf',
			'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'];

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			arrayProtos.forEach(function(item){
				socket.emit('set', item, false);
			});
		});

		var indexOf = Array.prototype.indexOf;

		socket.on('set', function(key, value){
			expect(indexOf.call(arrayProtos, key)).not.to.be(-1);
			expect(value).to.be(false);
			if (key == 'reduceRight') this.disconnect();
		});

		socket.on('disconnect', function(){
			done();
		});
	});


	it('should `error` on corrupt `set` keys', function(done){

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

			//socket.emit('set', [1], 1);
			socket.emit('set', [false], 2);
			socket.emit('set', [[]], 3);
			socket.emit('set', [{}], 4);
			socket.emit('set', [null], 5);
			socket.emit('set', [undefined], 6);
			socket.emit('set', ['a', false], 2);
			socket.emit('set', ['a', []], 3);
			socket.emit('set', ['a', {}], 4);
			socket.emit('set', ['a', null], 5);
			socket.emit('set', ['a', undefined], 6);
			socket.emit('set', 'done', 'finally');
		});

		socket.on('error', function(type, key, value){
			expect(type).to.be('set');
		});

		socket.on('set', function(key, value){
			if (key == 'done') this.disconnect();
			else console.log('WARNING', key, value);
		});

		socket.on('disconnect', function(){
			done();
		});
	});


});

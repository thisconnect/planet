exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Get', function(it){


	it('should `get` the current state', function(expect){
		expect.perform(5);
		var spy = new Spy();

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			expect(spy.getErrorCount()).toBe(0);
			expect(spy.getCallCount()).toBe(0);
			spy();

			socket.emit('get', function(data){
				expect(data).toBeType('object');
				expect(spy.getCallCount()).toBe(1);
				spy();
				socket.disconnect();
			});
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(2);
		});
	});


	it('should `get` the latest data', function(expect){
		expect.perform(5);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {a: {b: {c: 123}}});
		});

		first.on('post', function(data){
			first.emit('put', ['a', 'b', 'c'], 321);
		});

		first.on('put', function(key, value){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).toBeType('object');
				expect(data.a).toBeType('object');
				expect(data.a.b).toBeType('object');
				expect(data.a.b.c).toBeType('number');
				expect(data.a.b.c).toBe(321);
				this.disconnect();
			});
		});
	});


	it('should emit `get` search a value by key', function(expect){
		expect.perform(13);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {a: {b: {c: 0}}});
		});

		first.on('post', function(data){
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
				expect(data).toBeType('object');
				expect(data.a).toBeType('object');
				expect(data.a.b).toBeType('object');
				expect(data.a.b.c).toBeType('number');
				expect(data.a.b.c).toBe(0);
			});

			second.emit('get', 'a', function(data){
				expect(data).toBeType('object');
				expect(data.b).toBeType('object');
				expect(data.b.c).toBeType('number');
				expect(data.b.c).toBe(0);
			});

			second.emit('get', ['a', 'b'], function(data){
				expect(data).toBeType('object');
				expect(data.c).toBeType('number');
				expect(data.c).toBe(0);
			});

			second.emit('get', ['a', 'b', 'c'], function(data){
				expect(data).toBe(0);
				second.disconnect();
			});
		});
	});


	it('should return null for nonexistent or invalid keys', function(expect){
		expect.perform(4);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {a: {b: {c: 0}}});
		});

		first.on('post', function(data){
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
				expect(data).toBeNull();
			});

			second.emit('get', 1, function(data){
				expect(data).toBeNull();
			});

			second.emit('get', [null], function(data){
				expect(data).toBeNull();
			});

			second.emit('get', ['no', 'key', 'here'], function(data){
				expect(data).toBeNull();
			});

			second.emit('get', new Date(), function(data){
				expect(data).toBeNull();
				second.disconnect();
			});
		});
	});


	it('should error on invalid keys', function(expect){
		expect.perform(1);
		var spy = new Spy();

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {a: {b: {c: 0}}});
		});

		first.on('post', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.on('error', function(){
				spy();
				if (spy.getCallCount() == 4) second.disconnect();
			});

			second.emit('get', null, function(data){});
			second.emit('get', undefined, function(data){});
			second.emit('get', [], function(data){});
			second.emit('get', {}, function(data){});

			second.on('disconnect', function(){
				expect(spy.getCallCount()).toBe(4);
			});
		});
	});


});

};

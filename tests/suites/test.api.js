exports.setup = function(Tests){

var channel = function(){
	return '/' + (+new Date);
};

var Spy = require('../testigo/Source/lib/spy').Spy;

Tests.describe('Planet API: Connection', function(it){

	it('should send an `initial state` message after connect', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});
		socket.on('initial state', function(data){
			//console.log('initial state', data);
			expect(data).toBeType('object');
			this.disconnect();
		});
	});

});

Tests.describe('Planet API: Attempted Updates', function(it){

	it('should allow for attempted updates', function(expect){
		expect.perform(3);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('update', {
				key: 'key-u',
				value: 123
			});
		});

		socket.on('state update', function(data){
			expect(data).toBeType('object');
			expect(data.key).toBe('key-u');
			expect(data.value).toBe(123);
			this.disconnect();
		});
	});

	it('should return a lock `error` for locked keys', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('lock error');
				expect(data).toBe('key-y');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-y');
			});

			second.on('lock acquired', function(data){
				first.emit('update', {
					key: 'key-y',
					value: 34
				});
			});

		});
	});

});

Tests.describe('Planet API: Locks', function(it){

	it('should return `lock acquired` for unlocked keys', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'key-y');
		});

		socket.on('lock acquired', function(data){
			expect(data).toBe('key-y');
			this.disconnect();
		});
	});

	it('should broadcast locks', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('lock key', function(data){
				expect(data).toBe('key-z');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-z');
			});

		});
	});

	it('should return an acquire lock `error` for locked keys', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('acquire lock error');
				expect(data).toBe('key-g');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-g');
			});

			second.on('lock acquired', function(data){
				first.emit('acquire lock', 'key-g');
			});

		});
	});

	it('should broadcast unlocks', function(expect){
		expect.perform(1);
		
		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('release key', function(data){
				expect(data).toBe('key-i');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-i');
			});

			second.on('lock acquired', function(data){
				second.emit('release lock', 'key-i');
			});

		});
	});

	it('should unlock keys', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('lock acquired', function(data){
				expect(data).toBe('key-h');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-h');
			});

			second.on('lock acquired', function(data){
				second.emit('release lock', 'key-h');
			});

			second.on('lock released', function(data){
				first.emit('acquire lock', 'key-h');
			});

		});
	});

	it('should unlock keys locked by disconnecting clients', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('release key', function(data){
				expect(data).toBe('key-j');
				this.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-j');
			});

			second.on('lock acquired', function(data){
				this.disconnect();
			});

		});
	});

});

Tests.describe('Planet API: Updates', function(it){

	it('should echo a `state update` message', function(expect){
		expect.perform(3);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'key-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'key-x'){
				socket.emit('update', {
					key: 'key-x',
					value: 567
				});
			}
		});

		socket.on('state update', function(data){
			expect(data).toBeType('object');
			expect(data.key).toBe('key-x');
			expect(data.value).toBe(567);
			this.disconnect();
		});
	});

	it('should broacast `update` data to all connected clients', function(expect){
		expect.perform(6);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.key).toBe('key-x');
				expect(data.value).toBe(5050);
				this.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-x');
			});

			second.on('lock acquired', function(data){
				if (data == 'key-x'){
					second.emit('update', {
						key: 'key-x',
						value: 5050
					});
				}
			});

			second.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.key).toBe('key-x');
				expect(data.value).toBe(5050);
				this.disconnect();
			});

		});
	});

	it('should reply an update `error` message for corrupt `update` requests', function(expect){
		expect.perform(5);
		var spy = new Spy(),
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'key-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'key-x'){
				socket.emit('update', {
					//key: 'key-x', // no key
					value: 789
				});
				socket.emit('update', {
					name: 'key-x', // or wrong key
					value: 789
				});
				socket.emit('update', {
					key: 'key-x'//,
					//value: 789 // or missing value
				});
				socket.emit('update'); // or no data at all
			}
		});

		socket.on('error', function(name, data){
			expect(name).toBe('update error');
			spy();
			if (spy.getCallCount() > 3) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(4);
		});
	});

});

Tests.describe('Planet API: Put', function(it){

	it('should allow to put an object', function(expect){
		expect.perform(5);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 12,
				'key-b': 23
			});
		});

		socket.on('put', function(data){
			expect(data).toBeType('object');
			expect('key-a' in data).toBeTrue();
			expect('key-b' in data).toBeTrue();
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBe(23);
			this.disconnect();
		});
	});

	it('should put data to all connected clients', function(expect){
		expect.perform(10);
		var first = io.connect(null, {'force new connection': 1});

		first.on('put', function(data){
			expect(data).toBeType('object');
			expect('key-a' in data).toBeTrue();
			expect('key-b' in data).toBeTrue();
			expect(data['key-a']).toBe(12);
			expect(data['key-b']).toBe(23);
			this.disconnect();
		});

		first.on('connect', function(){
			var second = io.connect(null, {'force new connection': 1});

			second.on('put', function(data){
				expect(data).toBeType('object');
				expect('key-a' in data).toBeTrue();
				expect('key-b' in data).toBeTrue();
				expect(data['key-a']).toBe(12);
				expect(data['key-b']).toBe(23);
				this.disconnect();
			});

			second.on('connect', function(){
				first.emit('put', {
					'key-a': 12,
					'key-b': 23
				});
			});
		});

	});

	it('should put nested objects', function(expect){
		expect.perform(4);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('put', {
				'key-a': 12,
				'key-b': {
					'key-c': 34
				}
			});
			socket.emit('put', {
				'key-b': {
					'key-d': 56
				}
			});

			socket.on('disconnect', function(){
				var second = io.connect(null, {'force new connection': 1});
				second.on('initial state', function(data){
					expect(data).toBeType('object');
					expect(data['key-b']).toBeType('object');
					expect(data['key-b']['key-c']).toBe(34);
					expect(data['key-b']['key-d']).toBe(56);
					this.disconnect();
				});
			});

			this.disconnect();
		});
	});

});

Tests.describe('Planet API: Delete', function(it){

	it('should allow for delete object', function(expect){
		expect.perform(5);
		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-d': 5,
				'key-e': 6
			});
		});

		first.on('put', function(data){
			first.emit('delete', 'key-d');
		});

		first.on('delete', function(data){
			expect(data).toBe('key-d');
			this.disconnect();
			
			var second = io.connect(null, {'force new connection': 1});
			second.on('initial state', function(data){
				expect(data).toBeType('object');
				expect('key-d' in data).toBeFalse();
				expect('key-e' in data).toBeTrue();
				expect(data['key-e']).toBe(6);
				this.disconnect();
			});
		});
	});

});

};

exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


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

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('lock key', function(data){
				expect(data).toBe('key-z');
				this.disconnect();
				second.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-z');
			});

		});
	});

	it('should return a lock `error` for locked keys', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('lock error');
				expect(data).toBe('key-y');
				this.disconnect();
				second.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-y');
			});

			second.on('lock acquired', function(data){
				first.emit('post', {
					key: 'key-y',
					value: 34
				});
			});

		});
	});

	it('should return an acquire lock `error` for locked keys', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('acquire lock error');
				expect(data).toBe('key-g');
				this.disconnect();
				second.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
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
		
		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('release key', function(data){
				expect(data).toBe('key-i');
				this.disconnect();
				second.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
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

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('lock acquired', function(data){
				expect(data).toBe('key-h');
				this.disconnect();
				second.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
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

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('release key', function(data){
				expect(data).toBe('key-j');
				this.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-j');
			});

			second.on('lock acquired', function(data){
				this.disconnect();
			});

		});
	});

});

Tests.describe('Planet API: Lock and Post', function(it){

	it('should echo a `post` message', function(expect){
		expect.perform(3);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'key-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'key-x'){
				socket.emit('post', {
					key: 'key-x',
					value: 567
				});
			}
		});

		socket.on('post', function(data){
			expect(data).toBeType('object');
			expect(data.key).toBe('key-x');
			expect(data.value).toBe(567);
			this.disconnect();
		});
	});

	it('should broacast `post` data to all connected clients', function(expect){
		expect.perform(6);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){

			first.on('post', function(data){
				expect(data).toBeType('object');
				expect(data.key).toBe('key-x');
				expect(data.value).toBe(5050);
				this.disconnect();
			});

			var second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'key-x');
			});

			second.on('lock acquired', function(data){
				if (data == 'key-x'){
					second.emit('post', {
						key: 'key-x',
						value: 5050
					});
				}
			});

			second.on('post', function(data){
				expect(data).toBeType('object');
				expect(data.key).toBe('key-x');
				expect(data.value).toBe(5050);
				this.disconnect();
			});

		});
	});

	it('should reply an post `error` message for corrupt `post` requests', function(expect){
		expect.perform(5);
		var spy = new Spy(),
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'key-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'key-x'){
				socket.emit('post', {
					//key: 'key-x', // no key
					value: 789
				});
				socket.emit('post', {
					name: 'key-x', // or wrong key
					value: 789
				});
				socket.emit('post', {
					key: 'key-x'//,
					//value: 789 // or missing value
				});
				socket.emit('post'); // or no data at all
			}
		});

		socket.on('error', function(name, data){
			expect(name).toBe('post error');
			spy();
			if (spy.getCallCount() > 3) this.disconnect();
		});

		socket.on('disconnect', function(){
			expect(spy.getCallCount()).toBe(4);
		});
	});

});

};

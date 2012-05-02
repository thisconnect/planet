exports.setup = function(Tests){

var channel = function(){
	return '/' + (+new Date);
};

Tests.describe('Planet API: Connection', function(it){

	it('should send an `initial state` message after connect', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});
		socket.on('initial state', function(data){
			console.log('initial state', data);
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
				component: 'component-u',
				payload: 123
			});
		});

		socket.on('state update', function(data){
			console.log('state update', data);
			expect(data).toBeType('object');
			expect(data.component).toBe('component-u');
			expect(data.payload).toBe(123);
			this.disconnect();
		});
	});

	it('should return a `lock error` for locked components.', function(expect){
		expect.perform(1);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('lock error', function(data){
				expect(data).toBe('component-y');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-y');
			});

			socket.on('lock acquired', function(data){
				client.emit('update', {
					component: 'component-y',
					payload: 34
				});
			});

		});
	});

});

Tests.describe('Planet API: Locks', function(it){

	it('should return `lock acquired` for unlocked components', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'component-y');
		});

		socket.on('lock acquired', function(data){
			expect(data).toBe('component-y');
			this.disconnect();
		});
	});

	it('should broadcast locks', function(expect){
		expect.perform(1);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('lock component', function(data){
				expect(data).toBe('component-z');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-z');
			});

		});
	});

	it('should return an `acquire lock error` for locked components', function(expect){
		expect.perform(1);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('acquire lock error', function(data){
				expect(data).toBe('component-g');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-g');
			});

			socket.on('lock acquired', function(data){
				client.emit('acquire lock', 'component-g');
			});

		});
	});

	it('should broadcast unlocks', function(expect){
		expect.perform(1);
		
		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('release component', function(data){
				expect(data).toBe('component-i');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-i');
			});

			socket.on('lock acquired', function(data){
				socket.emit('release lock', 'component-i');
			});

		});
	});

	it('should unlock components', function(expect){
		expect.perform(1);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('lock acquired', function(data){
				expect(data).toBe('component-h');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-h');
			});

			socket.on('lock acquired', function(data){
				socket.emit('release lock', 'component-h');
			});
			socket.on('lock released', function(data){
				client.emit('acquire lock', 'component-h');
			});

		});
	});

	it('should unlock components locked by disconnecting clients', function(expect){
		expect.perform(1);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('release component', function(data){
				expect(data).toBe('component-j');
				this.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-j');
			});

			socket.on('lock acquired', function(data){
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
			socket.emit('acquire lock', 'component-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'component-x'){
				socket.emit('update', {
					component: 'component-x',
					payload: 567
				});
			}
		});

		socket.on('state update', function(data){
			expect(data).toBeType('object');
			expect(data.component).toBe('component-x');
			expect(data.payload).toBe(567);
			this.disconnect();
		});
	});

	it('it should broacast `update` data to all connected clients', function(expect){
		expect.perform(6);

		var socket,
			client = io.connect(null, {'force new connection': 1});

		client.on('connect', function(){

			client.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.component).toBe('component-x');
				expect(data.payload).toBe(5050);
				this.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.on('connect', function(){
				socket.emit('acquire lock', 'component-x');
			});

			socket.on('lock acquired', function(data){
				if (data == 'component-x'){
					socket.emit('update', {
						component: 'component-x',
						payload: 5050
					});
				}
			});

			socket.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.component).toBe('component-x');
				expect(data.payload).toBe(5050);
				this.disconnect();
			});

		});
	});

	it('should send back an `update error` message for incorrect `update` requests', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'component-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'component-x'){
				socket.emit('update', {
					//name: 'component-x', // wrong or no key
					payload: 789
				});
			}
		});
		socket.on('update error', function(data){
			expect(data).toBe(null);
			this.disconnect();
		});
	});

});

};

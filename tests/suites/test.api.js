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
				component: 'component-u',
				payload: 123
			});
		});

		socket.on('state update', function(data){
			expect(data).toBeType('object');
			expect(data.component).toBe('component-u');
			expect(data.payload).toBe(123);
			this.disconnect();
		});
	});

	it('should return a lock `error` for locked components', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('lock error');
				expect(data).toBe('component-y');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-y');
			});

			second.on('lock acquired', function(data){
				first.emit('update', {
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

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('lock component', function(data){
				expect(data).toBe('component-z');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-z');
			});

		});
	});

	it('should return an acquire lock `error` for locked components', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('error', function(name, data){
				expect(name).toBe('acquire lock error');
				expect(data).toBe('component-g');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-g');
			});

			second.on('lock acquired', function(data){
				first.emit('acquire lock', 'component-g');
			});

		});
	});

	it('should broadcast unlocks', function(expect){
		expect.perform(1);
		
		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('release component', function(data){
				console.log('release component', data);
				expect(data).toBe('component-i');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-i');
			});

			second.on('lock acquired', function(data){
				second.emit('release lock', 'component-i');
			});

		});
	});

	it('should unlock components', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('lock acquired', function(data){
				expect(data).toBe('component-h');
				this.disconnect();
				second.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-h');
			});

			second.on('lock acquired', function(data){
				second.emit('release lock', 'component-h');
			});

			second.on('lock released', function(data){
				first.emit('acquire lock', 'component-h');
			});

		});
	});

	it('should unlock components locked by disconnecting clients', function(expect){
		expect.perform(1);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('release component', function(data){
				expect(data).toBe('component-j');
				this.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-j');
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

	it('should broacast `update` data to all connected clients', function(expect){
		expect.perform(6);

		var first = io.connect(null, {'force new connection': 1}),
			second;

		first.on('connect', function(){

			first.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.component).toBe('component-x');
				expect(data.payload).toBe(5050);
				this.disconnect();
			});

			second = io.connect(null, {'force new connection': 1});
			second.on('connect', function(){
				second.emit('acquire lock', 'component-x');
			});

			second.on('lock acquired', function(data){
				if (data == 'component-x'){
					second.emit('update', {
						component: 'component-x',
						payload: 5050
					});
				}
			});

			second.on('state update', function(data){
				expect(data).toBeType('object');
				expect(data.component).toBe('component-x');
				expect(data.payload).toBe(5050);
				this.disconnect();
			});

		});
	});

	it('should reply an update `error` message for corrupt `update` requests', function(expect){
		expect.perform(5);
		var spy = new Spy(),
			socket = io.connect(null, {'force new connection': 1});

		socket.on('connect', function(){
			socket.emit('acquire lock', 'component-x');
		});

		socket.on('lock acquired', function(data){
			if (data == 'component-x'){
				socket.emit('update', {
					//component: 'component-x', // no key
					payload: 789
				});
				socket.emit('update', {
					name: 'component-x', // or wrong key
					payload: 789
				});
				socket.emit('update', {
					component: 'component-x'//,
					//payload: 789 // or missing payload
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
				'component-a': 12,
				'component-b': 23
			});
		});

		socket.on('put', function(data){
			expect(data).toBeType('object');
			expect('component-a' in data).toBeTrue();
			expect('component-b' in data).toBeTrue();
			expect(data['component-a']).toBe(12);
			expect(data['component-b']).toBe(23);
			this.disconnect();
		});
	});

	it('should put data to all connected clients', function(expect){
		expect.perform(10);
		var first = io.connect(null, {'force new connection': 1});

		first.on('put', function(data){
			expect(data).toBeType('object');
			expect('component-a' in data).toBeTrue();
			expect('component-b' in data).toBeTrue();
			expect(data['component-a']).toBe(12);
			expect(data['component-b']).toBe(23);
			this.disconnect();
		});

		first.on('connect', function(){
			var second = io.connect(null, {'force new connection': 1});

			second.on('put', function(data){
				expect(data).toBeType('object');
				expect('component-a' in data).toBeTrue();
				expect('component-b' in data).toBeTrue();
				expect(data['component-a']).toBe(12);
				expect(data['component-b']).toBe(23);
				this.disconnect();
			});

			second.on('connect', function(){
				first.emit('put', {
					'component-a': 12,
					'component-b': 23
				});
			});
		});

	});

});

Tests.describe('Planet API: Delete', function(it){

	it('should allow for delete object', function(expect){
		expect.perform(5);
		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'component-d': 5,
				'component-e': 6
			});
		});

		first.on('put', function(data){
			first.emit('delete', 'component-d');
		});

		first.on('delete', function(data){
			expect(data).toBe('component-d');
			this.disconnect();
			
			var second = io.connect(null, {'force new connection': 1});
			second.on('initial state', function(data){
				expect(data).toBeType('object');
				expect('component-d' in data).toBeFalse();
				expect('component-e' in data).toBeTrue();
				expect(data['component-e']).toBe(6);
				this.disconnect();
			});
		});
	});

});

};

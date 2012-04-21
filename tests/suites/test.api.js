exports.setup = function(Tests){

var channel = function(){
	return '/' + (+new Date);
};

Tests.describe('Planet API: Connection', function(it){

	it('should send an `initial_state` message after connect', function(expect){
		expect.perform(2);
		var socket = io.connect(null, {'force new connection': 1});
		socket.addListener('message', function(data){
			data = JSON.parse(data);
			expect(data.type).toBe('initial_state');
			expect(data.payload).toBeType('object');
			this.disconnect();
		});
	});

});

Tests.describe('Planet API: Attempted Updates', function(it){

	it('should allow for attempted updates', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.addListener('connect', function(){
			socket.send(JSON.stringify({
				type: 'attempt_update',
				payload: {
					component: 'component-u',
					payload: 999
				}
			}));
		});

		socket.addListener('message', function(data){
			data = JSON.parse(data);
			if (data.type != 'state_update') return;
			expect(data.payload['component-u']).toBe(999);
			this.disconnect();
		});
	});

	it('should return a `lock_error` for locked components.', function(expect){
		expect.perform(1);

		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'lock_error') return;
				expect(data.payload).toBe('component-y');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-y'
				}));
			});

			socket.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'lock_acquired') return;
				client.send(JSON.stringify({
					type: 'attempt_update',
					payload: {
						component: 'component-y',
						payload: 123
					}
				}));
			});

		});
	});

});

Tests.describe('Planet API: Locks', function(it){

	it('should lock components', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.addListener('connect', function(){
			socket.send(JSON.stringify({
				type: 'state_update',
				payload: {
					component: 'component-x',
					payload: 999
				}
			}));
		});

		socket.addListener('message', function(data){
			data = JSON.parse(data);
			if (data.type != 'lock_error') return;
			expect(data.payload).toBe('component-x');
			this.disconnect();
		});
	});

	it('should return `lock_acquired` for unlocked components', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.addListener('connect', function(){
			socket.send(JSON.stringify({
				type: 'acquire_lock',
				payload: 'component-y'
			}));
		});

		socket.addListener('message', function(data){
			data = JSON.parse(data);
			if (data.type != 'lock_acquired') return;
			expect(data.payload).toBe('component-y');
			this.disconnect();
		});
	});

	it('should broadcast locks', function(expect){
		expect.perform(1);

		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'lock_component') return;
				expect(data.payload).toBe('component-z');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-z'
				}));
			});

		});
	});

	it('should return an `acquire_lock_error` for locked components', function(expect){
		expect.perform(2);

		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'acquire_lock_error') return;
				expect(data.payload).toBeType('object');
				expect(data.payload.component).toBe('component-g');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-g'
				}));
			});

			socket.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'lock_acquired') return;
				client.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-g'
				}));
			});

		});
	});

	it('should broadcast unlocks', function(expect){
		expect.perform(1);
		
		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'release_component') return;
				expect(data.payload).toBe('component-i');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-i'
				}));
			});

			socket.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type == 'lock_acquired'){
					socket.send(JSON.stringify({
						type: 'release_lock',
						payload: 'component-i'
					}));
				}
			});

		});
	});

	it('should unlock components', function(expect){
		expect.perform(1);

		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type != 'lock_acquired') return;
				expect(data.payload).toBe('component-h');
				this.disconnect();
				socket.disconnect();
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-h'
				}));
			});

			socket.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type == 'lock_acquired'){
					socket.send(JSON.stringify({
						type: 'release_lock',
						payload: 'component-h'
					}));
				} else if (data.type == 'lock_released'){
					client.send(JSON.stringify({
						type: 'acquire_lock',
						payload: 'component-h'
					}));
				}
			});

		});
	});

});

Tests.describe('Planet API: Updates', function(it){

	it('should echo a `state_update` message', function(expect){
		expect.perform(2);
		var socket = io.connect(null, {'force new connection': 1});

		socket.addListener('connect', function(){
			socket.send(JSON.stringify({
				type: 'acquire_lock',
				payload: 'component-x'
			}));
		});

		socket.addListener('message', function(data){
			data = JSON.parse(data);
			if (data.type == 'lock_acquired' && data.payload == 'component-x'){
				socket.send(JSON.stringify({
					type: 'state_update',
					payload: {
						component: 'component-x',
						payload: 999
					}
				}));
			} else if (data.type == 'state_update'){
				expect(data.payload).toBeType('object');
				expect(data.payload['component-x']).toBe(999);
				this.disconnect();
			}
		});
	});

	it('it should broacast `state_update` data to all connected clients', function(expect){
		expect.perform(4);

		var socket, client = io.connect(null, {'force new connection': 1});
		client.addListener('connect', function(){

			client.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type == 'state_update'){
					expect(data.payload).toBeType('object');
					expect(data.payload['component-x']).toBe(5050);
					this.disconnect();
				}
			});

			socket = io.connect(null, {'force new connection': 1});
			socket.addListener('connect', function(){
				socket.send(JSON.stringify({
					type: 'acquire_lock',
					payload: 'component-x'
				}));
			});

			socket.addListener('message', function(data){
				data = JSON.parse(data);
				if (data.type == 'lock_acquired' && data.payload == 'component-x'){
					socket.send(JSON.stringify({
						type: 'state_update',
						payload: {
							component: 'component-x',
							payload: 5050
						}
					}));
				} else if (data.type == 'state_update'){
					expect(data.payload).toBeType('object');
					expect(data.payload['component-x']).toBe(5050);
					this.disconnect();
				}
			});

		});
	});

	it('should send back an `update_error` message for incorrect `state_update` requests', function(expect){
		expect.perform(1);
		var socket = io.connect(null, {'force new connection': 1});

		socket.addListener('connect', function(){
			socket.send(JSON.stringify({
				type: 'acquire_lock',
				payload: 'component-x'
			}));
		});

		socket.addListener('message', function(data){
			data = JSON.parse(data);
			if (data.type == 'lock_acquired' && data.payload == 'component-x'){
				socket.send(JSON.stringify({
					type: 'state_update',
					payload: {
						//name: 'component-x', // wrong or no key
						payload: 999
					}
				}));
			} else if (data.type == 'update_error'){
				expect(data.payload).toBe(null);
				this.disconnect();
			}
		});
	});

});

};

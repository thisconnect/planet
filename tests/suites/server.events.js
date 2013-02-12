var planet = require('../../planet'),
	server = require('http').createServer(),
	socket = require('socket.io').listen(server, {
		'transports': ['websocket']
		, 'flash policy server': false
		, 'log level': 1
	});


exports.setup = function(Tests){

	Tests.describe('Planet Server API: Events', function(it){

		it('should receive events on the server sent by client', function(expect){

			var earth = planet(socket);
			server.listen(8201, 'localhost');

			expect(earth).toBeAnInstanceOf(require('events').EventEmitter);

			earth.on('listening', function(){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
			});

			earth.on('connection', function(socket){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
			});

			earth.on('merge', function(data){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
				expect(data).toBeType('object');
			});

			earth.on('set', function(key, value){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
				expect(key).toBeType('array');
				expect(key).toBeSimilar(['bag', 'milk']);
				expect(value).toBeType('number');
				expect(value).toBe(2);
			});

			earth.on('remove', function(key){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
				expect(key).toBeType('array');
				expect(key).toBeSimilar(['bag', 'eggs']);
				
				earth.get('bag', function(data){
					expect(data).toHaveProperty('milk');
					expect(data).not.toHaveProperty('eggs');
					expect(data).toBeSimilar({'milk': 2});
				});
			});

			earth.on('delete', function(){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);

				earth.get(function(data){
					expect(data).toBeSimilar({});
				});
			});

			earth.on('disconnect', function(socket){
				expect(this).toBeAnInstanceOf(planet);
				expect(this).toBe(earth);
				expect(socket).toBeType('object');
			});

			// client
			var io = require('socket.io-client'),
				client = io.connect('//:8201', {
					'force new connection': true
				});

			client.on('connect', function(){
				client.emit('merge', {
					bag: {
						milk: 1,
						eggs: 6
					},
					box: [1, 2, 3, 4, 5, 6]
				});

				client.on('merge', function(data){
					client.emit('set', ['bag', 'milk'], 2);
				});

				client.on('set', function(key, data){
					client.emit('remove', ['bag', 'eggs']);
				});

				client.on('remove', function(key){
					client.emit('delete');
				});

				client.on('delete', function(){
					client.disconnect();
				});
			});

		});

		it('should receive events on the client sent by server', function(expect){

			var earth = planet(socket);
			server.listen(8201, 'localhost');

			earth.on('listening', function(){

				// test on the client
				var io = require('socket.io-client'),
					client = io.connect('//:8201', {
						'force new connection': true
					});

				client.on('connect', function(){

					client.on('merge', function(data){
						expect(data).toBeType('object');
					});

					client.on('set', function(key, value){
						expect(key).toBeType('array');
						expect(value).toBeType('number');
						expect(key).toBeSimilar(['bag', 'eggs']);
						expect(value).toBe(4);
					});

					client.on('remove', function(key){
						expect(key).toBeType('array');
						expect(key).toBeSimilar(['bag', 'milk']);
					});

					client.on('delete', function(){
						client.emit('get', function(data){
							expect(data).toBeSimilar({});
							client.disconnect();
						});
					});
				});

				// test on the server
				earth.on('merge', function(data){
					expect(data).toBeType('object');
				});

				earth.on('set', function(key, value){
					expect(key).toBeType('array');
					expect(value).toBeType('number');
					expect(key).toBeSimilar(['bag', 'eggs']);
					expect(value).toBe(4);
				});

				earth.on('remove', function(key){
					expect(key).toBeType('array');
					expect(key).toBeSimilar(['bag', 'milk']);
				});

				earth.on('delete', function(){
					earth.get(function(data){
						expect(data).toBeSimilar({});
					});
				});

			});

			// server
			earth.on('connection', function(socket){
				earth.merge({
					'bag': {
						'milk': 3,
						'eggs': 5
					},
					'box': [6, 7]
				});
				earth.set(['bag', 'eggs'], 4);

				earth.on('remove', function(){
					earth.get(function(data){
						expect(data).toBeLike({
							'bag': {'eggs': 4},
							'box': [6, 7]
						});
					});
					earth.get('bag', function(data){
						expect(data).toHaveProperty('eggs');
						expect(data).not.toHaveProperty('milk');
						expect(data).toBeLike({'eggs': 4});
						earth.delete();
					});
				});
				earth.remove(['bag', 'milk']);
			});

			earth.on('disconnect', function(socket){
				earth.destroy();
				server.close();
			});

		});

	});

};
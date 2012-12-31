var planet = require('../../planet'),
	server = require('http').createServer(),
	socket = require('socket.io').listen(server, {
		'transports': ['websocket']
		, 'flash policy server': false
		, 'log level': 1
	});


exports.setup = function(Tests){

	Tests.describe('Planet Server: Events', function(it){

		it('should receive client events', function(expect){

			var earth = planet(socket, {});
			server.listen(8201, 'localhost');

			earth.on('listening', function(){
				expect(earth).toBeAnInstanceOf(require('events').EventEmitter);
			});

			earth.on('connection', function(socket){
				expect(this).toBe(earth);
			});

			earth.on('post', function(data){
				expect(data).toBeType('object');
			});

			earth.on('put', function(key, value){
				expect(key).toBeType('array');
				expect(value).toBeType('number');
				expect(key).toBeSimilar(['bag', 'milk']);
				expect(value).toBe(2);
			});

			earth.on('remove', function(key){
				expect(key).toBeType('array');
				expect(key).toBeSimilar(['bag', 'eggs']);
				earth.emit('get', 'bag', function(data){
					expect(data).toBeSimilar({milk: 2});
				});
			});

			earth.on('delete', function(){
				earth.emit('get', function(data){
					expect(data).toBeSimilar({});
				});
			});

			earth.on('disconnect', function(socket){
				expect(this).toBeAnInstanceOf(planet);
				expect(socket).toBeType('object');
				earth.destroy();
				server.close();
			});

			// client
			var io = require('socket.io-client'),
				client = io.connect('//localhost:8201', {
					'force new connection': true
				});

			client.on('connect', function(){

				client.emit('post', {
					bag: {
						milk: 1,
						eggs: 6
					},
					box: [1, 2, 3, 4, 5, 6]
				});

				client.on('post', function(data){
					client.emit('put', ['bag', 'milk'], 2);
				});

				client.on('put', function(key, data){
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

		it('should emit client events', function(expect){

			var earth = planet(socket, {});
			server.listen(8201, 'localhost');

			earth.on('listening', function(){

				// client
				var io = require('socket.io-client'),
					client = io.connect('//localhost:8201', {
						'force new connection': true
					});

				client.on('connect', function(){

					client.on('post', function(data){
					console.log('--------------------', 1);
						expect(data).toBeType('object');
						expect().toBe();
					});

					client.on('put', function(key, data){
					console.log('--------------------', 2);
						expect(key).toBeType('array');
						expect(value).toBeType('number');
						expect(key).toBeSimilar(['bag', 'eggs']);
						expect(value).toBe(4);
					});

					client.on('remove', function(key){
					console.log('--------------------', 3);
						expect(key).toBeType('array');
						expect(key).toBeSimilar(['bag', 'milk']);
						earth.emit('get', 'bag', function(data){
							expect(data).toBeSimilar({eggs: 4});
						});
					});

					client.on('delete', function(){
						client.emit('get', function(data){
							expect(data).toBeSimilar({});
						});
						client.disconnect();
					});
				});
			});

			earth.on('connection', function(){
				earth.emit('post', {
					bag: {
						milk: 3,
						eggs: 5
					},
					box: [6, 7]
				});
				earth.emit('put', ['bag', 'eggs'], 4);
				earth.emit('remove', ['bag', 'milk']);

				earth.on('remove', function(){
					console.log('--------------------', 4);
					earth.emit('delete');
				});
			});

			earth.on('disconnect', function(socket){
				earth.destroy();
				server.close();
			});

		});
	});

};
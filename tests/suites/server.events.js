var planet = require('../../planet'),
	server = require('http').createServer(),
	socket = require('socket.io').listen(server, {
		'transports': ['websocket']
		, 'flash policy server': false
		, 'log level': 1
	});


exports.setup = function(Tests){

	Tests.describe('Planet Server: Events', function(it){

		it('should allow some client events', function(expect){

			var earth = planet(socket, {});
			server.listen(8201, 'localhost');

			earth.on('listening', function(){
				expect(earth).toBeAnInstanceOf(require('events').EventEmitter);
			});

			earth.on('connect', function(){
				expect(this).toBe(earth);
				console.log(arguments);
				//earth.destroy();
				//server.close();
			});

			earth.on('post', function(){
			});

			earth.on('put', function(){
			});

			earth.on('remove', function(){
			});

			earth.on('delete', function(){
			});

			earth.emit('get', function(){
			});

			var io = require('socket.io-client'),
				client = io.connect('//localhost:8201', {
					'force new connection': true
				});

			client.on('connect', function(){
				expect(this).toBe(client);
				//client.disconnect();
			});

			client.on('connect_failed', function(){
				console.log('-----------------', 3);
				//client.disconnect();
			});
		});
	});

};
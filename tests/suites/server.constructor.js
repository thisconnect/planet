var planet = require('../../planet'),
	http = require('http'),
	io = require('socket.io');


exports.setup = function(Tests){

	Tests.describe('Planet Server API: Constructor', function(it){

		it('should start new planet', function(expect){

			var server = http.createServer(),
				socket = io.listen(server, {'log level': 1});

			var mercury = new planet(socket);

			server.listen(8101, '127.0.0.1');

			mercury.on('listening', function(location, port){
				expect(mercury).toBeAnInstanceOf(planet);
				expect(this).toBeAnInstanceOf(planet);

				expect(location).toBeType('string');
				expect(port).toBeType('number');

				expect(location).toBe('127.0.0.1');
				expect(port).toBe(8101);

				mercury.destroy();
				server.close();
			});

		});

		it('should create a new instance when called without the `new` operator', function(expect){

			var server = http.createServer(),
				socket = io.listen(server, {'log level': 1});

			var venus = planet(socket);

			expect(venus).toBeAnInstanceOf(planet);

			server.listen(8102);

			venus.on('listening', function(location, port){
				expect(port).toBe(8102);
				venus.destroy();
				server.close();
			});
		});

		it('should start planet without a http server', function(expect){

			var socket = io.listen(8103, {
				'log level': 1
			});

			planet(socket)
				.on('listening', function(location, port){
					expect(port).toBe(8103);

					require('socket.io-client')
						.connect('//:8103')
						.on('connect', function(){
							this.disconnect();
						});
				})
				.on('connection', function(socket){
					expect(socket).toBeType('object');
				})
				.on('disconnect', function(socket){
					expect(socket).toBeType('object');
					this.destroy();
				});
		});


		it('should run the readme.md example', function(expect){
			// server
			var planet = require('planet'),
				socket = require('socket.io').listen(8104, {
					'log level': 1
				});

			var venus = new planet(socket);

			var io = require('socket.io-client');

			// client 1
			io.connect('//:8104')
				.on('put', function(key, value){
					// console.log(key, value);
				})
				.on('merge', function(data){
					// console.log(data);
					expect(data).toHaveProperty('sugar');
					expect(data).toHaveProperty('milk');
					expect(data.sugar).toBe(1);
					expect(data.milk).toBe(0);
					this.disconnect();
				});

			// client 2	
			io.connect('//:8104', {'force new connection': true})
				.on('connect', function(){
					this.emit('merge', {
						sugar: 1,
						milk: 0
					});

					this.emit('put', 'sugar', 2);
					this.emit('put', 'milk', 100);

					this.emit('get', function(data){
						// console.log(data);
						expect(data).toHaveProperty('sugar');
						expect(data).toHaveProperty('milk');
						expect(data.sugar).toBe(2);
						expect(data.milk).toBe(100);
						this.disconnect();
					});
				})
				.on('disconnect', function(){
					venus.destroy();
					socket.server.close();
				});

		});


		it('should return planet cli help', function(expect){

			var exec = require('child_process').exec;

			exec('./bin/planet --help', function(error, stdout, stderr){
				expect(error).toBeNull();
				expect(stdout).toMatch(/Usage:/);
				expect(stdout).toMatch(/Available options:/);
			});

		});

		it('should start planet from cli', function(expect){

			var spawn = require('child_process').spawn;

			var child = spawn('./bin/planet', ['--port', 8105]);

			child.stdout.on('data', function(data){
				data = data.toString();
				expect(data).toMatch(/Planet started/);
				expect(data).toMatch(/8105/);
				child.kill();
			});

			child.stderr.on('data', function(error){
				console.log('error', error.toString());
			});

		});

	});

};

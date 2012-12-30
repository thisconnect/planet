var planet = require('../../planet'),
	http = require('http'),
	io = require('socket.io');


exports.setup = function(Tests){

	Tests.describe('Planet Server: Constructor', function(it){

		it('should start new planet', function(expect){

			var server = http.createServer(),
				socket = io.listen(server, {'log level': 1});

			var mercury = new planet(socket, {});

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

		it('should start planet', function(expect){

			var server = http.createServer(),
				socket = io.listen(server, {'log level': 1});

			var venus = planet(socket, {});

			server.listen(8102);

			venus.on('listening', function(location, port){
				expect(port).toBe(8102);
				venus.destroy();
				server.close();
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

			var child = spawn('./bin/planet', ['--port', 8103]);
			child.stdout.on('data', function(data){
				data = data.toString();
				expect(data).toMatch(/Planet started/);
				expect(data).toMatch(/8103/);
				child.kill();
			});
			child.stderr.on('data', function(error){
				console.log('error', error.toString());
			});

		});

	});

};

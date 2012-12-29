var planet = require('../../planet'),
	http = require('http'),
	io = require('socket.io');


exports.setup = function(Tests){

	Tests.describe('Planet: Constructor', function(it){

		it('should start new planet', function(expect){

			var server = http.createServer(),
				socket = io.listen(server, {'log level': 1});

			var venus = planet(socket, {});
			expect(venus).toBeAnInstanceOf(planet);

			var mercury = new planet(socket, {});
			expect(mercury).toBeAnInstanceOf(planet);
//			socket.server.close();

			expect(mercury).not.toBe(venus);
		//	server.listen(8080, 'localhost');
			//server.close();

		});
	});

};

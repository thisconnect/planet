var planet = require('../../planet'),
	server = require('http').createServer(),
	socket = require('socket.io').listen(server, {
		'transports': ['websocket']
		, 'flash policy server': false
		, 'log level': 1
	});


exports.setup = function(Tests){

	Tests.describe('Planet: Events', function(it){

		it('should allow client events', function(expect){

			var earth = planet(socket, {});
			server.listen(8004, 'localhost');

			expect(earth).toBeAnInstanceOf(require('events').EventEmitter);


		});
	});

};
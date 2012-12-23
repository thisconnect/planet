var http = require('http'),
	socketio = require('socket.io'),
	planet = require('../../planet');
	

exports.setup = function(tests){

	tests.setCallbacks({
		before: function(){
			var server = http.createServer();

			var socket = socketio.listen(server, {
				'transports': ['websocket']
				, 'flash policy server': false
				, 'log level': 1
			});

			planet(socket, {});

			server.listen(8004, 'localhost');
		}
	});

	require('./server.utils').setup(tests);
	require('./test.client').setup(tests);

};

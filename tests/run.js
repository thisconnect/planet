var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);


Tests.setCallbacks({
	before: function(){
		var planet = require('../'),
			server = require('http').createServer(),
			io = require('socket.io');

		var socket = io.listen(server, {
			'transports': ['websocket']
			, 'flash policy server': false
			, 'log level': 1
		});

		new planet(socket, {});
		server.listen(8004, 'localhost');
	},
	after: function(success, results){
		process.exit(0);
	}
});


var client = require('socket.io-client');

// Import client api tests
require('./suites/test.client').setup(Tests, client);


// Import server api tests
require('./suites/test.server').setup(Tests);


// Run tests
Runner.run();

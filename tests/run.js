var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);


Tests.setCallbacks({
	after: function(success, results){
		process.exit(0);
	}
});


// Import server api tests
require('./suites/test.server').setup(Tests);


var planet = require('../../planet'),
	server = require('http').createServer(),
	io = require('socket.io');

var socket = io.listen(server, {
	'transports': ['websocket']
	, 'flash policy server': false
	, 'log level': 1
});

planet(socket, {});
server.listen(8004, 'localhost');


// Import client api tests
require('./suites/test.client')
	.setup(Tests, require('socket.io-client'));


// Run tests
Runner.run();

io = require('socket.io-client');

var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);

Tests.setCallbacks({
	after: function(success, results){
		process.exit(0);
	}
});

// Import client api tests
require('./suites/test.server').setup(Tests);

// Run tests
Runner.run();

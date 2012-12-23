io = require('socket.io-client');

var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);

Tests.setCallbacks({
	after: function(success, results){
		process.exit(0);
	}
});

require('./suites/server.utils').setup(Tests);

// Import client api tests
require('./suites/test.client').setup(Tests);

// Run tests
Runner.run();

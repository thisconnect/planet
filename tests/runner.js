var Testigo = require('./testigo/Source/testigo').Testigo,
	Tests = new Testigo(),
	Runner = new Testigo.Runners.Simple('node', Tests);

Tests.setCallbacks({
	after: function(success, results){
		process.exit(0);
	}
});

// Import test cases
require('./suites/tests').setup(Tests);

// Run tests
Runner.run();

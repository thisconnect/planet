var dummy = require('./dummy');

for (var i = 0; ++i <= process.argv[2];) (dummy)(i);

// process.exit(0); // success = 0, error = 1

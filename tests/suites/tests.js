if (this.window == null) io = require('../../node_modules/socket.io/node_modules/socket.io-client');

exports.setup = function(tests){

	require('./test.connect').setup(tests);
	require('./test.post').setup(tests);
	require('./test.put').setup(tests);
	require('./test.get').setup(tests);
	require('./test.delete').setup(tests);
	require('./test.stress').setup(tests);

};

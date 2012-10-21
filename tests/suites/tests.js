if (this.window == null) io = require('../../node_modules/socket.io/node_modules/socket.io-client');

exports.setup = function(tests){

	require('./client.connect').setup(tests);
	require('./client.post').setup(tests);
	require('./client.put').setup(tests);
	require('./client.get').setup(tests);
	require('./client.delete').setup(tests);
	require('./client.remove').setup(tests);
	require('./client.stress').setup(tests);

};

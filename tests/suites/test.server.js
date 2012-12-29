exports.setup = function(tests){

	require('./server.utils').setup(tests);
	require('./server.constructor').setup(tests);
	require('./server.events').setup(tests);

};

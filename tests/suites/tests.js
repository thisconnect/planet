exports.setup = function(tests){

	require('./test.api').setup(tests);
	require('./test.locks').setup(tests);

};

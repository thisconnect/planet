exports.setup = function(tests){

	require('./test.connect').setup(tests);
	require('./test.post').setup(tests);
	require('./test.put').setup(tests);
	require('./test.delete').setup(tests);

};

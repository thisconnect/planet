exports.setup = function(tests, io){

	require('./client.connect').setup(tests, io);
	require('./client.set').setup(tests, io);
	require('./client.merge').setup(tests, io);
	require('./client.get').setup(tests, io);
	require('./client.delete').setup(tests, io);
	require('./client.remove').setup(tests, io);
	require('./client.array').setup(tests, io);
	require('./client.stress').setup(tests, io);

};

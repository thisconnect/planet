var io = require('socket.io-client');

module.exports = function(i){

	var socket = io.connect(process.argv[3] || '//:8004', {
		'force new connection': 1,
		'try multiple transports': false,
		'reconnect': false
	});

	socket.on('connect', function(){
		console.log(i);
	});
	socket.on('connect_failed', function(){});
	socket.on('error', function(){});
	//socket.emit('get', function(data){});
	socket.on('set', function(){});
	socket.on('merge', function(){});
	socket.on('remove', function(){});
	socket.on('delete', function(){});
	socket.on('disconnect', function(){});


	/*
	socket.on('disconnect', function(){
		process.exit(0);
	});

	// Errors

	socket.on('connect_failed', function(){
		process.stderr.write('ERROR (connect_failed)! \n');
		process.exit(1);
	});

	socket.on('error', function(){
		process.stderr.write('ERROR! \n');
		process.exit(1);
	});

	// process.exit(0); // success = 0, error = 1
	*/

	return socket;
}

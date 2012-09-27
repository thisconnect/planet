var io = require('../node_modules/socket.io/node_modules/socket.io-client'),
	microtime = require('microtime');

var now = microtime.now, // microtime.now for µs (or Date.now for ms)
	timestamp = 0,
	logs = {};

function log(message){
	logs[message] = now() - timestamp;
	timestamp = now();
}

timestamp = now();

log('start');

var socket = io.connect('//:8999', {
	'force new connection': 1,
	'try multiple transports': false,
	'reconnect': false
});

log('connect');

socket.on('connect', function(){
	log('on connect');
});

socket.on('get', function(data){
	log('on get');

	// put some data
	socket.emit('put', {'mice': 12});
	log('put');
});

socket.on('put', function(){
	log('on put');

	// post a property
	socket.emit('post', 'mice', 13);
	log('post');
});

socket.on('post', function(){
	log('on post');

	// delete key
	socket.emit('delete', 'mice');
	log('delete');
});

socket.on('delete', function(){
	log('on delete');

	// disconnect
	socket.disconnect();
	log('disconnect');
});

socket.on('disconnect', function(){
	log('on disconnect');
	process.stdout.write(JSON.stringify(logs));
	//console.log('end');
});


// End

socket.on('disconnect', function(){
	process.exit(0);
});

process.on('exit', function(){
	if (socket.socket.connected) socket.disconnect();
});

// Errors

socket.on('connect_failed', function(){
	process.stderr.write('ERROR (connect_failed)! \n');
});

socket.on('error', function(){
	process.stderr.write('ERROR! \n');
});

// process.exit(0); // success = 0, error = 1


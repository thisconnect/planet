var io = require('socket.io-client');

// var microtime = require('microtime');

var now = Date.now, // microtime.now for µs (or Date.now for ms)
	timestamp = 0,
	logs = {};

function log(message){
	logs[message] = now() - timestamp;
	timestamp = now();
}

timestamp = now();

log('start');

var socket = io.connect(process.argv[2] || '://8004', {
	'force new connection': 1,
	'try multiple transports': false,
	'reconnect': false
});

log('connect');

socket.on('connect', function(){
	log('on connect');
});

socket.emit('get', function(data){
	log('on get');

	// post some data
	socket.emit('post', {'mice': 12});
	log('post');
});

socket.on('post', function(){
	log('on post');

	// put a property
	socket.emit('put', 'mice', 13);
	log('put');
});

socket.on('put', function(){
	log('on put');

	// remove key
	socket.emit('remove', 'mice');
	log('remove');
});

socket.on('remove', function(){
	log('on remove');

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
	process.stderr.write('socket failed to connect!\n');
});

socket.on('error', function(){
	process.stderr.write('socket error!\n');
});

// process.exit(0); // success = 0, error = 1


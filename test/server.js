var connect = require('connect'),
	io = require('socket.io'),
	planet = require('../');

var server = connect()
.use(connect.static(__dirname + '/public'))
//.use('/client', connect.static(__dirname + '/client'))
.listen(8004, '127.0.0.1');

var socket = io.listen(server, {
	'log level': 1
});

new planet(socket);

console.log('browse tests @ http://127.0.0.1:8004/');

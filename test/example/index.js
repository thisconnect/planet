var connect = require('connect'),
	io     	= require('socket.io'),
	planet 	= require('../../'),
	network = require('os').networkInterfaces();

var ip = network.en1[network.en1.length - 1].address;

var server = connect()
	.use(connect.static(__dirname + '/public'))
	.listen(8004, ip);

console.log('\nbrowse to http://' + ip + ':8004/');


var socket = io.listen(server, {
	'transports': ['websocket'],
	'flash policy server': false,
	'log level': 1//,
	//'browser client': false,
	//'browser client cache': true,
	//'browser client minification': true,
	//'browser client gzip': true
});


planet(socket);

var sys = require('util'),
	slice = Array.prototype.slice;

exports.Logger = {

	register: function(server){},

	onConnect: function(server, host, port){
		this.log('Planet started at', (host) ? [host, port].join(':') : port);
		this.log('Accepting connections..');
	},

	onClientConnect: function(server, conn){
		this.log('Client connect -', conn.id);
	},

	onClientMessage: function(server, conn, type, data){
		this.log('Message', conn.id, '-', JSON.stringify(data));
	},

	onClientDisconnect: function(server, conn){
		this.log('Disconnect -', conn.id);
	},


	log: function(){
		sys.log.call(sys, slice.call(arguments).join(' '));
	}

};

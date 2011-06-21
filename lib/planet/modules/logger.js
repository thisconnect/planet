(function(){

var sys = require('sys'),
	slice = Array.prototype.slice;

var Logger = exports.Logger = {

	register: function(server){
	},

	onConnect: function(server, host, port){
		this.log('Planet started at', (host) ? [host, port].join(':') : port);
		this.log('Accepting connections..');
	},

	onClientConnect: function(server, conn){
		this.log('Connect -', conn.sessionId);
	},

	onClientMessage: function(server, conn, type, data){
		this.log('Message', conn.sessionId, '-', JSON.stringify(data));
	},

	onClientDisconnect: function(server, conn){
		this.log('Disconnect -', conn.sessionId);
	},

	onComponentLocked: function(server, component, session){
		this.log('Component Locked - ', component, '/', session);
	},

	onComponentReleased: function(server, component, session){
		this.log('Component Released - ', component, '/', session);
	},


	log: function(){
		sys.log.call(sys, slice.call(arguments).join(' '));
	}

};

})();

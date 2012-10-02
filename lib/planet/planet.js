(function(){

// base modules
var EventEmitter = require('events').EventEmitter,
	io			 = require('socket.io'),
	utils		 = require('./lib/utils.js');

function Planet(server, options){
	options = utils.merge({}, Planet.Options, options || {});
	utils.uses.apply(this, options.uses);
	this.addServer(server, {
		'transports': ['websocket'],
		'flash policy server': false,
		'log level': 1/*,
		'browser client': true,
		'browser client cache': true,
		'browser client minification': true,
		'browser client gzip': true*/
	});
}

// Extensions
Planet.Logger = require('./modules/logger').Logger;
Planet.State  = require('./modules/state').State;

Planet.defaultModules = [Planet.Logger, Planet.State];

// Default Options
Planet.Options = {
	uses: Planet.defaultModules
};


Planet.prototype = utils.extend(new EventEmitter, {

	listen: function(port, host){
		var that = this;
		port = port || '8999';
		host = host || null;
		this.$server.listen(port, host);
		this.$server.on('listening', function(){
			that.emit('listening', that, host, port);
		});
		return this;
	},

	send: function(t, h, i, s){
		this.$socket.sockets.emit(t, h, i, s);
		return this;
	},

	addServer: function(server, options){
		this.$server = server;
		server.maxConnections = 256; // ulimit // server.connections
		server.on('clientError', this.onClientError);
		var socket = this.$socket = io.listen(server, options);
		socket.sockets.on('connection', this.onConnection.bind(this));
		return this;
	},

	count: 0,

	onConnection: function(conn){
		this.count++;
		//console.log(this.count, this.$server.connections);
		if (this.$server.connections > 220) console.warn('ulimit', this.$server.connections, 256);

		if (this.count > 220 || this.$server.connections > 256){
			this.count--;
			return conn.disconnect();
		}
		conn.on('message', this.onMessage.bind(this, conn));
		conn.on('disconnect', this.onDisconnect.bind(this, conn));
		this.emit('clientConnect', this, conn);
	},

	onMessage: function(conn, data){
		this.$socket.sockets.emit('message', data);
		this.emit('clientMessage', this, conn, data);
	},

	onDisconnect: function(conn){
		// console.log(this.count, this.$server.connections);
		this.count--;
		this.emit('clientDisconnect', this, conn);
	},

	onClientError: function(error){
		console.log('clientError', error);
	}

});

exports.Planet = Planet;

})();


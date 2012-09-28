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
		this.$server.listen(port, host, function(){
			that.emit('connect', that, host, port);
		});
		return this;
	},

	count: 0,

	onConnect: function(conn){
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

	send: function(t, h, i, s){
		this.$socket.sockets.emit(t, h, i, s);
		return this;
	},

	addServer: function(server, options){
		this.$server = server;
		server.maxConnections = 256; // ulimit

		server.on('request', this.onRequest.bind(this));
		server.on('clientError', this.onClientError);

		var socket = this.$socket = io.listen(server, options);

	//	setInterval(function(){
	//		console.log(that.count, server.connections);
	//	}, 10000);

		socket.sockets.on('connection', this.onConnect.bind(this));
		return this;
	},

	// handlers

	onRequest: function(req, res){
		// console.log(req.url, req.headers);
		// return res.end();
		this.emit('request', this, req, res);
		process.nextTick(this.processRequest.bind(this, req, res));
	},

	processRequest: function(req, res){
		// console.log('processRequest', this.count, this.$server.connections);
		var matches = null,
			url = utils.getPath(req.url);
		if (url == '/'){
			res.writeHead(200, {'Content-Type': 'text/html'});
			res.write('<script src="/socket.io/socket.io.js"></script>');
			res.end('<h1>Planet</h1>\n');
		} else if (matches = url.match(/^\/tests(?:\/(.*))?/)){
			if (!matches[1]) matches[1] = 'index.html';
			process.nextTick(utils.serveTests.bind(null, res, matches[1], url));
		} else {
			utils.serveError(res, url);
		}
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


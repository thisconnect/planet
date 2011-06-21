(function(){

// base modules
var EventEmitter = require('events').EventEmitter,
	http		 = require('http'),
	socketio	 = require('./../../support/socket.io/'),
	utils		 = require('./lib/utils.js');

function Planet(options){
	options = utils.merge({}, Planet.Options, options || {});
	this.uses.apply(this, options.uses);
	this.createServers();
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

	// extensions and registers

	uses: function(){
		var args = Array.prototype.slice.call(arguments),
			matches;
		for (var i = 0, len = args.length; i < len; i++){
			var current = args[i];
			if (current instanceof Function) current(this);
			else if (typeof current == 'object' && !Array.isArray(current)){
				if (current.register) current.register(this);
				for (var key in current){
					if (typeof current[key] == 'function' && (matches = key.match(/^on(.*)$/))){
						var event = matches[1].split('');
						event[0] = event[0].toLowerCase();
						event = event.join('');
						this.addListener(event, current[key].bind(current));
					}
				}
			}
		}
		return this;
	},

	addListeners: function(events){
		for (var name in events){
			this.addListener(name, events[name]);
		}
	},


	// main methods

	listen: function(port, host){
		var self = this;
		port = port || '8999';
		host = host || null;
		this.$server.listen(port, host, function(){
			self.emit('connect', self, host, port);
		});
		return this;
	},


	createServers: function(){
		var server = this.$server = http.createServer(this.onRequest.bind(this));

		var socket = this.$socket = socketio.listen(server, {
			flashPolicyServer: false,
			log: function(){ /* silence */ }
		});
		socket.addListener('clientConnect', this.onConnect.bind(this));
		socket.addListener('clientMessage', this.onMessage.bind(this));
		socket.addListener('clientDisconnect', this.onDisconnect.bind(this));

		return this;
	},


	// handlers

	onRequest: function(req, res){
		this.emit('request', this, req, res);
		process.nextTick(this.processRequest.bind(this, req, res));
	},

	processRequest: function(req, res){
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

	onConnect: function(conn){
		this.emit('clientConnect', this, conn);
		return this;
	},

	onDisconnect: function(conn){
		this.emit('clientDisconnect', this, conn);
	},

	onMessage: function(data, conn){
		try { 
			if (typeof data == 'string') data = JSON.parse(data);
		} 
		catch (e){ return this.onMessageError(data, conn); }

		this.emit('clientMessage', this, conn, data.type, data);
		this.emit('clientMessage.' + data.type, this, conn, data);
	},

	onMessageError: function(data, conn){
		this.emit('clientMessageError', this, conn, data);
	}


});

exports.Planet = Planet;

})();


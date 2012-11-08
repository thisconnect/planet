var Emitter = require('events').EventEmitter,
	set = require('./lib/util').set,
	get = require('./lib/util').get,
	merge = require('./lib/util').merge,
	isArray = require('./lib/util').isArray,
	log = require('util').log;


function Planet(io, options){
	if (!(this instanceof Planet)) return new Planet(io, options);

	var server = this.$server = io.server;
	this.$io = io;
	io.sockets.on('connection', this.onConnection.bind(this));
	server.on('listening', this.onListening.bind(this));
	server.on('clientError', this.onClientError.bind(this));
}


// Planet.prototype = Object.create(Emitter.prototype);

Planet.prototype = {

	onListening: function(){
		var location = this.$server.address();
		log('Planet started at ' + [location.address, location.port].join(':'));
		//this.emit('listening', this, location.address, location.port);
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
		this.onConnect(conn);
		//this.emit('clientConnect', this, conn);
	},

	onMessage: function(conn, data){
		this.$io.sockets.emit('message', data);
		// this.emit('clientMessage', this, conn, data);
	},

	onDisconnect: function(conn){
		// console.log(this.count, this.$server.connections);
		this.count--;
		// this.emit('clientDisconnect', this, conn);
	},

	onClientError: function(error){
		console.log('clientError', error);
	},

	send: function(t, h, i, s){
		this.$io.sockets.emit(t, h, i, s);
		return this;
	},

	state: {},

	onConnect: function(conn){
		conn.on('post',   this.onPost.bind(this, conn));
		conn.on('delete', this.onDelete.bind(this));
		conn.on('put',    this.onPut.bind(this, conn));
		conn.on('remove', this.onRemove.bind(this, conn));
		conn.on('get',    this.onGet.bind(this, conn));
	},

	onPost: function(conn, data){
		if (typeof data != 'object' 
			|| data == null
			|| toString.call(data) != '[object Object]'
		){
			return conn.emit('error', 'post', data);
		}
		merge(this.state, data);
		this.send('post', data);
	},

	onDelete: function(){
		this.send('delete');
		this.state = {};
	},

	onPut: function(conn, key, value){
		if (value === undefined
			|| (typeof key != 'string' && !isArray(key))
			|| (key.length != null && key.length == 0)
		){
			return conn.emit('error', 'put', key, value);
		}
		if (typeof key == 'string') this.state[key] = value;
		else set(this.state, key, value);

		this.send('put', key, value);
	},

	onRemove: function(conn, key){
		var k, o;

		if (typeof key == 'string'){
			k = key;
			o = this.state;
		} else {
			if (!isArray(key)
				|| key.length == 0
				|| key.some(function(item){
					return typeof item != 'string';
				})
			){
				return conn.emit('error', 'remove', key);
			}
			k = key.pop();
			o = get(this.state, key);
			key.push(k);
		}

		if (!(k in o)){
			return conn.emit('error', 'remove', key);
		}
		delete o[k];
		this.send('remove', key);
	},

	onGet: function(conn, key, fn){
		if (typeof key == 'function') fn = key;
		else if (typeof fn != 'function'
			|| key == null
			|| (key.length == 0 && isArray(key))
			|| toString.call(key) == '[object Object]'
		){
			return conn.emit('error', 'get', key, fn);
		}
		if (typeof key == 'number') fn(null); // todo array
		return (typeof key == 'string' ? fn(this.state[key])
			: isArray(key) ? fn(get(this.state, key))
			: fn(this.state)
		);
	}

};


module.exports = Planet;

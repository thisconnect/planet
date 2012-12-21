var Emitter = require('events').EventEmitter,
	set = require('./lib/util').set,
	get = require('./lib/util').get,
	merge = require('./lib/util').merge,
	isArray = require('./lib/util').isArray,
	log = require('util').log;


function Planet(io, options){
	if (!(this instanceof Planet)) return new Planet(io, options);
	this.limit = options.limit || 200;

	this.server = io.server
		.on('clientError', this.onError.bind(this))
		.on('listening', this.onListening.bind(this));

	this.sockets = io.sockets
		.on('connection', this.onConnection.bind(this));

}

Planet.prototype = Object.create(Emitter.prototype);

Planet.prototype.onListening = function(){
	var location = this.server.address();
	log('Planet started at ' + [location.address, location.port].join(':'));
	// this.emit('listening', this, location.address, location.port);
};

Planet.prototype.count = 0;

Planet.prototype.onConnection = function(conn){
	this.count++;
	if (this.count > this.limit || this.server.connections > this.limit){
		this.count--;
		return conn.disconnect();
	}
	conn.on('message', this.onMessage.bind(this, conn));
	conn.on('disconnect', this.onDisconnect.bind(this, conn));
	conn.on('post',   this.onPost.bind(this, conn));
	conn.on('delete', this.onDelete.bind(this));
	conn.on('put',    this.onPut.bind(this, conn));
	conn.on('remove', this.onRemove.bind(this, conn));
	conn.on('get',    this.onGet.bind(this, conn));
	//this.emit('clientConnect', this, conn);
};

Planet.prototype.onMessage = function(conn, data){
	this.sockets.emit('message', data);
	// this.emit('clientMessage', this, conn, data);
};

Planet.prototype.onDisconnect = function(conn){
	this.count--;
	// log(this.count, this.server.connections);
	// this.emit('clientDisconnect', this, conn);
};

Planet.prototype.onError = function(error){
	log('error', error);
};

Planet.prototype.send = function(t, h, i, s){
	this.sockets.emit(t, h, i, s);
	return this;
};

Planet.prototype.state = {};

Planet.prototype.onPost = function(conn, data){
	if (typeof data != 'object' 
		|| data == null
		|| toString.call(data) != '[object Object]'
	){
		return conn.emit('error', 'post', data);
	}
	merge(this.state, data);
	this.send('post', data);
};

Planet.prototype.onDelete = function(){
	this.send('delete');
	this.state = {};
};

Planet.prototype.onPut = function(conn, key, value){
	if (value === undefined
		|| (typeof key != 'string' && !isArray(key))
		|| (key.length != null && key.length == 0)
	){
		return conn.emit('error', 'put', key, value);
	}
	if (typeof key == 'string') this.state[key] = value;
	else set(this.state, key, value);

	this.send('put', key, value);
};

Planet.prototype.onRemove = function(conn, key){
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
};

Planet.prototype.onGet = function(conn, key, fn){
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
};


module.exports = Planet;

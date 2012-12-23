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
		.on('listening', listen.bind(this))
		.on('clientError', error.bind(this));

	this.sockets = io.sockets
		.on('connection', connect.bind(this));

}

Planet.prototype = Object.create(Emitter.prototype);

Planet.prototype.state = {};
Planet.prototype.count = 0;

Planet.prototype.send = function(t, h, i, s){
	this.sockets.emit(t, h, i, s);
	//this.sockets.emit.apply(this.sockets, arguments);
	return this;
};

function listen(){
	var location = this.server.address();
	log('Planet started at ' + [location.address, location.port].join(':'));
	this.emit('listening', this, location.address, location.port);
}

function error(error){
	log('error', error);
}

function connect(conn){
	this.count++;
	if (this.count > this.limit || this.server.connections > this.limit){
		this.count--;
		return conn.disconnect();
	}
	conn.on('message', message.bind(this, conn));
	conn.on('disconnect', disconnect.bind(this, conn));
	conn.on('post',   onPost.bind(this, conn));
	conn.on('delete', onDelete.bind(this));
	conn.on('put',    onPut.bind(this, conn));
	conn.on('remove', onRemove.bind(this, conn));
	conn.on('get',    onGet.bind(this, conn));
	//this.emit('clientConnect', this, conn);
}

function disconnect(conn){
	this.count--;
	// log(this.count, this.server.connections);
	// this.emit('clientDisconnect', this, conn);
}

function message(conn, data){
	this.sockets.emit('message', data);
	// this.emit('clientMessage', this, conn, data);
}


function onPost(conn, data){
	if (typeof data != 'object' 
		|| data == null
		|| toString.call(data) != '[object Object]'
	){
		return conn.emit('error', 'post', data);
	}
	merge(this.state, data);
	this.send('post', data);
}

function onDelete(){
	this.send('delete');
	this.state = {};
}

function onPut(conn, key, value){
	if (value === undefined
		|| (typeof key != 'string' && !isArray(key))
		|| (key.length != null && key.length == 0)
	){
		return conn.emit('error', 'put', key, value);
	}
	if (typeof key == 'string') this.state[key] = value;
	else set(this.state, key, value);

	this.send('put', key, value);
}

function onRemove(conn, key){
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
}

function onGet(conn, key, fn){
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


module.exports = Planet;

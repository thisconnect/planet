var Emitter = require('events').EventEmitter,
	set = require('./lib/util').set,
	get = require('./lib/util').get,
	merge = require('./lib/util').merge,
	isArray = require('./lib/util').isArray;


function Planet(io, options){
	options = options || {};
	if (!(this instanceof Planet)) return new Planet(io, options);
	this.limit = options.limit || 200;
	this.state = {};
	this.count = 0;

	this.server = io.server
		.on('listening', listen.bind(this))
		.on('clientError', error.bind(this));

	this.sockets = io.sockets
		.on('connection', connect.bind(this));

}

Planet.prototype = Object.create(Emitter.prototype);

Planet.prototype.version = require('./package').version;

/*
Planet.prototype.send = function(t, h, i, s){
	this.sockets.emit(t, h, i, s);
	//this.sockets.emit.apply(this.sockets, arguments);
	return this;
};*/

Planet.prototype.destroy = function(){
	this.server.removeAllListeners();
	this.sockets.removeAllListeners();
	this.removeAllListeners();
};

function listen(){
	var location = this.server.address();
	this.send = this.sockets.emit.bind(this.sockets);

	this.put = onPut.bind(this, null);
	this.remove = onRemove.bind(this, null);
	this.merge = onMerge.bind(this, null);
	this.del = onDelete.bind(this, null);
	this.get = onGet.bind(this, null);

	// this.on('get', onGet.bind(this, null));
	this.emit('listening', location.address, location.port);
}

function error(error){
	console.log('error', error);
}

function connect(socket){
	this.count++;
	if (this.count > this.limit || this.server.connections > this.limit){
		this.count--;
		return socket.disconnect();
	}
	socket.on('disconnect',	disconnect.bind(this, socket))
		.on('put',			onPut.bind(this, socket))
		.on('remove',		onRemove.bind(this, socket))
		.on('merge',		onMerge.bind(this, socket))
		.on('delete',		onDelete.bind(this))
		.on('get',			onGet.bind(this, socket));

	this.emit('connection', socket);
}

function disconnect(socket){
	this.count--;
	this.emit('disconnect', socket);
}

function onMerge(socket, data){
	if (typeof data != 'object' 
		|| data == null
		|| toString.call(data) != '[object Object]'
	){
		return socket.emit('error', 'merge', data);
	}
	merge(this.state, data);
	this.send('merge', data);
	this.emit('merge', data);
}

function onDelete(){
	this.send('delete');
	this.state = {};
	this.emit('delete');
}

function onPut(socket, key, value){
	if (value === undefined
		|| (typeof key != 'string' && !isArray(key))
		|| (key.length != null && key.length == 0)
	){
		return socket.emit('error', 'put', key, value);
	}
	if (typeof key == 'string') this.state[key] = value;
	else set(this.state, key, value);

	this.send('put', key, value);
	this.emit('put', key, value);
}

function onRemove(socket, key){
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
			return socket.emit('error', 'remove', key);
		}
		k = key.pop();
		o = get(this.state, key);
		key.push(k);
	}

	if (!(k in o)){
		return socket.emit('error', 'remove', key);
	}

	delete o[k];
	this.send('remove', key);
	this.emit('remove', key);
}

function onGet(socket, key, fn){
	if (typeof key == 'function') fn = key;
	else if (typeof fn != 'function'
		|| key == null
		|| (key.length == 0 && isArray(key))
		|| toString.call(key) == '[object Object]'
	){
		return socket.emit('error', 'get', key, fn);
	}
	if (typeof key == 'number') fn(null); // todo array
	return (typeof key == 'string'
		? fn(this.state[key])
		: isArray(key)
			? fn(get(this.state, key))
			: fn(this.state)
	);
}


module.exports = Planet;

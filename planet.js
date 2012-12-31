var Emitter = require('events').EventEmitter,
	set = require('./lib/util').set,
	get = require('./lib/util').get,
	merge = require('./lib/util').merge,
	isArray = require('./lib/util').isArray;


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
	this.write = this.sockets.emit.bind(this.sockets);
	this.on('get', onGet.bind(this, null));
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
	socket.on('message',	message.bind(this, socket))
		.on('disconnect',	disconnect.bind(this, socket))
		.on('post',			onPost.bind(this, socket))
		.on('delete',		onDelete.bind(this))
		.on('put',			onPut.bind(this, socket))
		.on('remove',		onRemove.bind(this, socket))
		.on('get',			onGet.bind(this, socket));

	this.emit('connection', socket);
}

function disconnect(socket){
	this.count--;
	this.emit('disconnect', socket);
}

function message(socket, data){
	this.sockets.emit('message', data);
	// this.emit('clientMessage', this, socket, data);
}


function onPost(socket, data){
	if (typeof data != 'object' 
		|| data == null
		|| toString.call(data) != '[object Object]'
	){
		return socket.emit('error', 'post', data);
	}
	merge(this.state, data);
	this.write('post', data);
	this.emit('post', data);
}

function onDelete(){
	this.write('delete');
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

	this.write('put', key, value);
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
	this.write('remove', key);
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

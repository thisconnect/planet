var Emitter = require('events').EventEmitter,
	set = require('tool').set,
	get = require('tool').get,
	merge = require('tool').merge,
	isArray = require('tool').isArray;


function Planet(io, options){
	options = options || {};
	if (!(this instanceof Planet)) return new Planet(io, options);
	this.limit = options.limit || 200;
	this.state = {};
	this.count = 0;

	this.server = (!!io.manager ? io.manager.server : io.server)
		.on('listening', listen.bind(this))
		.on('clientError', error.bind(this));

	this.sockets = (!!io.manager ? io : io.sockets)
		.on('connection', connect.bind(this));

}

Planet.prototype = Object.create(Emitter.prototype);

Planet.prototype.version = require('./package').version;

Planet.prototype.destroy = function(){
	this.server.removeAllListeners();
	this.sockets.removeAllListeners();
	this.removeAllListeners();
};

function listen(){
	var location = this.server.address();
	this.send = this.sockets.emit.bind(this.sockets);

	this.set = onSet.bind(this, null);
	this.remove = onRemove.bind(this, null);
	this.merge = onMerge.bind(this, null);
	this.delete = onDelete.bind(this, null);
	this.get = onGet.bind(this, null);

	// this.on('get', onGet.bind(this, null));
	this.emit('listening', location.address, location.port);
}

function error(error){
	console.log('error', error);
}

function connect(socket){
	var that = this;
	this.server.getConnections(function(error, count){
		that.count++;
		if (that.count > that.limit || count > that.limit){
			that.count--;
			return socket.disconnect();
		}
		socket.on('disconnect',	disconnect.bind(that, socket))
			.on('set',			onSet.bind(that, socket))
			.on('remove',		onRemove.bind(that, socket))
			.on('merge',		onMerge.bind(that, socket))
			.on('delete',		onDelete.bind(that))
			.on('get',			onGet.bind(that, socket));

		that.emit('connection', socket);
	});
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

function onSet(socket, key, value){
	if (value === undefined
		|| (typeof key != 'string' && !isArray(key))
		|| (key.length != null && key.length == 0)
	){
		return socket.emit('error', 'set', key, value);
	}
	if (typeof key == 'string') this.state[key] = value;
	else if (!set(this.state, key, value)) return;

	this.send('set', key, value);
	this.emit('set', key, value);
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

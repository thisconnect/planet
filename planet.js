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

	this.send = this.sockets.emit.bind(this.sockets);
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

	this.set = this.emit.bind(this, 'set');
	this.on('set', function(key, value){
		if (typeof key == 'string') this.state[key] = value;
		else set(this.state, key, value);
		this.send('set', key, value);
	});

	this.remove = this.emit.bind(this, 'remove');
	this.on('remove', function(key){
		var k = key,
			o = this.state;

		if (typeof key != 'string'){
			k = key.pop();
			o = get(this.state, key);
			key.push(k);
		}
		delete o[k];
		this.send('remove', key);
	});

	this.merge = this.emit.bind(this, 'merge');
	this.on('merge', function(data){
		merge(this.state, data);
		this.send('merge', data);
	});

	this.delete = onDelete.bind(this, null);
//	this.get = onGet.bind(this, null);

	this.get = this.emit.bind(this, 'get');
	this.on('get', function(key, fn){
		if (typeof key == 'function') fn = key;

		if (typeof key == 'number') fn(null); // todo array
		return (typeof key == 'string'
			? fn(this.state[key])
			: isArray(key)
				? fn(get(this.state, key))
				: fn(this.state)
		);
	});

	// this.on('get', onGet.bind(this, null));
	this.emit('listening', location.address, location.port);
}

function error(error){
	console.log('error', error);
}

function connect(socket){
	var that = this;
	this.count++;
	if (this.count > this.limit || this.server.connections > this.limit){
		this.count--;
		return socket.disconnect();
	}
	socket
		.on('disconnect',	disconnect.bind(this, socket))
//		.on('set',			onSet.bind(this, socket))
		.on('set', function(key, value){
			if (value === undefined
				|| (typeof key != 'string' && !isArray(key))
				|| (key.length != null && key.length == 0)
			){
				return socket.emit('error', 'set', key, value);
			}
			that.emit('set', key, value);
		})
//		.on('remove',		onRemove.bind(this, socket))
		.on('remove', function(key){
			var k = key,
				o = that.state;

			if (typeof key != 'string'){
				if (!isArray(key)
					|| key.length == 0
					|| key.some(function(item){
						return typeof item != 'string';
					})
				){
					return socket.emit('error', 'remove', key);
				}
				k = key.pop();
				o = get(that.state, key);
				key.push(k);
			}

			if (!(k in o)){
				return socket.emit('error', 'remove', key);
			}
			that.emit('remove', key);
		})
//		.on('merge',		onMerge.bind(this, socket))
		.on('merge', function(data){
			if (typeof data != 'object'
				|| data == null
				|| toString.call(data) != '[object Object]'
			){
				return socket.emit('error', 'merge', data);
			}
			that.emit('merge', data);
		})
		.on('delete',		onDelete.bind(this))
//		.on('get',			onGet.bind(this, socket));
		.on('get', function(key, fn){
			if (typeof key == 'function') fn = key;
			else if (typeof fn != 'function'
				|| key == null
				|| (key.length == 0 && isArray(key))
				|| toString.call(key) == '[object Object]'
			){
				return socket.emit('error', 'get', key, fn);
			}
			that.emit('get', key, fn);
		});

	this.emit('connection', socket);
}

function disconnect(socket){
	this.count--;
	// socket.removeAllListeners(); // check
	this.emit('disconnect', socket);
}
/*
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
}*/

function onDelete(){
	this.send('delete');
	this.state = {};
	this.emit('delete');
}
/*
function onSet(socket, key, value){
	if (value === undefined
		|| (typeof key != 'string' && !isArray(key))
		|| (key.length != null && key.length == 0)
	){
		return socket.emit('error', 'set', key, value);
	}
	if (typeof key == 'string') this.state[key] = value;
	else set(this.state, key, value);

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
*/

module.exports = Planet;

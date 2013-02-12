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

Planet.prototype.set = function(key, value){
		if (typeof key == 'string') this.state[key] = value;
		else set(this.state, key, value);
		this.send('set', key, value);
		this.emit('set', key, value);
	};

Planet.prototype.remove = function(key){
		var k = key,
			o = this.state;

		if (typeof key != 'string'){
			k = key.pop();
			o = get(this.state, key);
			key.push(k);
		}
		delete o[k];
		this.send('remove', key);
		this.emit('remove', key);
	};

Planet.prototype.merge = function(data){
		merge(this.state, data);
		this.send('merge', data);
		this.emit('merge', data);
	};

Planet.prototype.delete = function(){
		this.state = {};
		this.send('delete');
		this.emit('delete');
	};

Planet.prototype.get = function(key, fn){
		if (typeof key == 'function') fn = key;

		if (typeof key == 'number') fn(null); // todo array
		return (typeof key == 'string'
			? fn(this.state[key])
			: isArray(key)
				? fn(get(this.state, key))
				: fn(this.state)
		);
	};


function listen(){
	var location = this.server.address();
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
		.on('disconnect', function(){
			that.count--;
			// socket.removeAllListeners(); // check
			that.emit('disconnect', socket);
		})
		.on('set', function(key, value){
			if (value === undefined
				|| (typeof key != 'string' && !isArray(key))
				|| (key.length != null && key.length == 0)
			){
				return socket.emit('error', 'set', key, value);
			}
			that.set(key, value);
		})
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
			that.remove(key);
		})
		.on('merge', function(data){
			if (typeof data != 'object'
				|| data == null
				|| toString.call(data) != '[object Object]'
			){
				return socket.emit('error', 'merge', data);
			}
			that.merge(data);
		})
		.on('delete', function onDelete(){
			that.delete();
		})
		.on('get', function(key, fn){
			if (typeof key == 'function') fn = key;
			else if (typeof fn != 'function'
				|| key == null
				|| (key.length == 0 && isArray(key))
				|| toString.call(key) == '[object Object]'
			){
				return socket.emit('error', 'get', key, fn);
			}
			that.get(key, fn);
		});

	this.emit('connection', socket);
}

module.exports = Planet;

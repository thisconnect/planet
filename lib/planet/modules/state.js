(function(){

// http://jsfiddle.net/k5Ywe/31/
function merge(o1, o2) {
	for (var p in o2) {
		o1[p] = (
			o1[p] != null
			&& o2[p] != null
			&& !Array.isArray(o1[p])
			&& !Array.isArray(o2[p])
			&& typeof o1[p] == 'object'
			&& typeof o2[p] == 'object'
		) ? merge(o1[p], o2[p]) : o2[p];
	}
	return o1;
}

// from https://github.com/csuwldcat/mootools-core/blob/2b9703c3bbd467020a39e56e383e08033ba310d9/Source/Types/Object.js#L23
function get(object, path){
	if (typeof path == 'string') path = path.split('.');
	for (var i = 0, l = path.length; i < l; i++){
		if (hasOwnProperty.call(object, path[i])) object = object[path[i]];
		else return object[path[i]];
	}
	return object;
}

function set(object, path, value){
	if (typeof path == 'string') path = path.split('.');
	var key = path.pop(),
		len = path.length,
		i = 0,
		current;
	while (len--){
		current = path[i++];
		object = current in object ? object[current] : (object[current] = {});
	}
	object[key] = value;
	path.push(key); // harmonize path
	return object;
}

exports.State = {

	register: function(server){
		server.$state = {};
		server.$locks = {};
		server.$timeouts = {};
	},

	send: function(server, event, data){
		server.$socket.sockets.emit(event, data);
		return this;
	},

	broadcast: function(conn, event, data){
		conn.broadcast.emit(event, data);
		return this;
	},

	reply: function(conn, event, data){
		conn.emit(event, data);
		return this;
	},

	error: function(conn, name, data){
		conn.emit('error', name, data);
		return this;
	},

	onClientConnect: function(server, conn){
		conn.on('update', this.onUpdate.bind(this, server, conn));
		conn.on('put', this.onPut.bind(this, server, conn));
		conn.on('delete', this.onDelete.bind(this, server, conn));
		conn.on('acquire lock', this.onAcquireLock.bind(this, server, conn));
		conn.on('release lock', this.onReleaseLock.bind(this, server, conn));
		this.reply(conn, 'initial state', server.$state);
	},

	onUpdate: function(server, conn, data){
		if (data == null || data.value == null){
			return this.error(conn, 'update error', data);
		}
		if (data.key == null && data.path == null){
			return this.error(conn, 'update error', data);
		}
		if (server.$locks[data.key] && server.$locks[data.key] !== conn.id){
			return this.error(conn, 'lock error', data.key);
		}
		if (data.path != null) set(server.$state, data.path, data.value);
		else server.$state[data.key] = data.value;

		this.send(server, 'state update', data);
	},

	onPut: function(server, conn, data){
		merge(server.$state, data);
		this.send(server, 'put', data);
	},

	onDelete: function(server, conn, key){
		if (server.$state[key] == null){
			return this.error(conn, 'delete error', key);
		}
		delete server.$state[key];
		this.releaseLock(server, conn, key);
		this.send(server, 'delete', key);
	},

	onAcquireLock: function(server, conn, key){
		var locks = server.$locks,
			timeouts = server.$timeouts;

		if (locks[key] && locks[key] != conn.id){
			return this.error(conn, 'acquire lock error', key);
		}
		if (timeouts[key]) clearTimeout(timeouts[key]);
		this.acquireLock(server, conn, key);
		timeouts[key] = setTimeout(this.releaseLock.bind(this, server, conn, key), 20000);
	},

	acquireLock: function(server, conn, key){
		server.$locks[key] = conn.id;
		this.reply(conn, 'lock acquired', key);
		this.broadcast(conn, 'lock key', key);
		server.emit('keyLocked', server, key, conn.id);
		return this;
	},

	onReleaseLock: function(server, conn, key){
		if (server.$locks[key] != conn.id){
			return this.error(conn, 'release lock error', key);
		}
		this.releaseLock(server, conn, key);
	},

	releaseLock: function(server, conn, key){
		var locks = server.$locks,
			timeouts = server.$timeouts;

		if (locks[key] == conn.id){
			if (timeouts[key]) clearTimeout(timeouts[key]);
			delete locks[key];
			delete timeouts[key];
			this.reply(conn, 'lock released', key);
			this.send(server, 'release key', key);
			server.emit('keyReleased', server, key, conn.id);
		}
		return this;
	},

	onClientDisconnect: function(server, conn){
		this.clearLocks(server, conn);
	},

	clearLocks: function(server, conn){
		for (var key in server.$locks){
			this.releaseLock(server, conn, key);
		}
		return this;
	}

};

})();

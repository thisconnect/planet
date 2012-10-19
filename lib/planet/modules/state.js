// var toString = Object.prototype.toString;

var isArray = Array.isArray ||
	function(o){
		return toString.call(o) === '[object Array]';
	};


var State = exports.State = {

	register: function(server){
		server.$state = {};
	},

	onClientConnect: function(server, conn){
		conn.on('post', this.onPost.bind(this, server, conn));
		conn.on('put', this.onPut.bind(this, server, conn));
		conn.on('delete', this.onDelete.bind(this, server, conn));
		conn.on('get', this.onGet.bind(this, server, conn));
		conn.emit('get', server.$state);
	},

	onPost: function(server, conn, key, value){
		if (value === undefined
			|| (typeof key != 'string' && !isArray(key))
			|| (key.length != null && key.length == 0)
		){
			return conn.emit('error', 'post', key, value);
		}
		if (typeof key == 'string') server.$state[key] = value;
		else this.set(server.$state, key, value);

		server.send('post', key, value);
	},

	onPut: function(server, conn, data){
		if (typeof data != 'object' 
			|| data == null
			|| toString.call(data) != '[object Object]'
		){
			return conn.emit('error', 'put', data);
		}
		this.merge(server.$state, data);
		server.send('put', data);
	},

	onDelete: function(server, conn, key){
		if ('string' != typeof key){
			return this.deletes(server, conn, key);

		} else if (!(key in server.$state)){
			return conn.emit('error', 'delete', key);
		}
		delete server.$state[key];
		server.send('delete', key);
	},

	deletes: function(server, conn, key){
		if (key === undefined){
			for (var k in server.$state) server.send('delete', k);
			return server.$state = {};
		}

		if (!isArray(key)
			|| key.length == 0
			|| key.some(function(item){
				return typeof item != 'string';
			})
		){
			return conn.emit('error', 'delete', key);
		}

		var k = key.pop(),
			found = this.get(server.$state, key);

		key.push(k);
		if (!(k in found)){
			return conn.emit('error', 'delete', key);
		}
		delete found[k];
		server.send('delete', key);
	},

	onGet: function(server, conn, key, fn){
		if (typeof key == 'function') fn = key;
		else if (typeof fn != 'function'
			|| key == null
			|| (key.length == 0 && isArray(key))
			|| toString.call(key) == '[object Object]'
		){
			return conn.emit('error', 'get', key, fn);
		}
		if (typeof key == 'number') fn(null); // todo array
		return (typeof key == 'string' ? fn(server.$state[key])
			: isArray(key) ? fn(this.get(server.$state, key))
			: fn(server.$state)
		);
	},

	merge: function(o1, o2){
		for (var p in o2) {
			o1[p] = (
				o1[p] != null
				&& o2[p] != null
				&& !isArray(o1[p])
				&& !isArray(o2[p])
				&& typeof o1[p] == 'object'
				&& typeof o2[p] == 'object'
			) ? State.merge(o1[p], o2[p]) : o2[p];
		}
		return o1;
	},

	get: function(object, path){
		for (var i = 0, l = path.length; i < l; i++){
			if (hasOwnProperty.call(object, path[i])) object = object[path[i]];
			else return object[path[i]];
		}
		return object;
	},

	set: function(object, path, value){
		path = (typeof path == 'string') ? path.split('.') : path.slice(0);
		var key = path.pop(),
			len = path.length,
			i = 0,
			current;

		if (typeof key != 'string') return null;

		while (len--){
			current = path[i++];
			object = current in object ? object[current] : (object[current] = {});
		}
		object[key] = value;
		return object;
	}

};

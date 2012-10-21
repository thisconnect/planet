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
		conn.on('delete', this.onDelete.bind(this, server));
		conn.on('remove', this.onRemove.bind(this, server, conn));
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

	onDelete: function(server){
		server.send('delete');
		server.$state = {};
	},

	onRemove: function(server, conn, key){
		var k, o;

		if (typeof key == 'string'){
			k = key;
			o = server.$state;
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
			o = this.get(server.$state, key);
			key.push(k);
		}

		if (!(k in o)){
			return conn.emit('error', 'remove', key);
		}
		delete o[k];
		server.send('remove', key);
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

	get: function(o, path){
		for (var i = 0, l = path.length; i < l; i++){
			if (hasOwnProperty.call(o, path[i])) o = o[path[i]];
			else return o[path[i]];
		}
		return o;
	},

	set: function(o, path, value){
		path = (typeof path == 'string') ? path.split('.') : path.slice(0);
		var key = path.pop(),
			len = path.length,
			i = 0,
			current;

		if (typeof key != 'string') return null;

		while (len--){
			current = path[i++];
			o = current in o ? o[current] : (o[current] = {});
		}
		o[key] = value;
		return o;
	}

};

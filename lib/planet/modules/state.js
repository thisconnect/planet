exports.State = {

	register: function(server){
		server.$state = {};
	},

	onClientConnect: function(server, conn){
		conn.on('post', this.onPost.bind(this, server, conn));
		conn.on('put', this.onPut.bind(this, server, conn));
		conn.on('delete', this.onDelete.bind(this, server, conn));
		conn.emit('get', server.$state);
	},

	onPost: function(server, conn, key, value){
		if (key == null || value == null){
			return conn.emit('error', 'post error', key);
		}
		if (typeof key == 'string') server.$state[key] = value;
		else this.set(server.$state, key, value);

		server.send('post', key, value);
	},

	onPut: function(server, conn, data){
		this.merge(server.$state, data);
		server.send('put', data);
	},

	onDelete: function(server, conn, key){
		if ('string' == typeof key){
			if (!key in server.$state){
				return conn.emit('error', 'delete error', key);
			}
			delete server.$state[key];
		} else {
			var target = server.$state;
			for (var i = 0, x; x = key[i]; ++i){
				if (i + 1 == key.length) delete target[x];
				else target = target[x];
			}
			delete target;
		}
		server.send('delete', key);
	},

	merge: function(o1, o2) {
		// http://jsfiddle.net/k5Ywe/31/
		for (var p in o2) {
			o1[p] = (
				o1[p] != null
				&& o2[p] != null
				&& !Array.isArray(o1[p])
				&& !Array.isArray(o2[p])
				&& typeof o1[p] == 'object'
				&& typeof o2[p] == 'object'
			) ? this.merge(o1[p], o2[p]) : o2[p];
		}
		return o1;
	},

	// from https://github.com/csuwldcat/mootools-core/blob/2b9703c3bbd467020a39e56e383e08033ba310d9/Source/Types/Object.js#L23

	get: function(object, path){
		if (typeof path == 'string') path = path.split('.');
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

		while (len--){
			current = path[i++];
			object = current in object ? object[current] : (object[current] = {});
		}
		object[key] = value;
		return object;
	}

};

(function(){

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
		if (data == null || data.component == null || data.payload == null){
			return this.error(conn, 'update error', data);
		}
		if (server.$locks[data.component] && server.$locks[data.component] !== conn.id){
			return this.error(conn, 'lock error', data.component);
		}
		server.$state[data.component] = data.payload;
		return this.send(server, 'state update', data);
	},

	onPut: function(server, conn, data){
		for (var key in data){
			server.$state[key] = data[key];
		}
		this.send(server, 'put', data);
	},

	onDelete: function(server, conn, key){
		if (server.$state[key] == null){
			return this.error(conn, 'delete error', key);
		}
		delete server.$state[key];
		this.releaseLock(server, conn, key);
		return this.send(server, 'delete', key);
	},

	onAcquireLock: function(server, conn, component){
		var locks = server.$locks;
		if (locks[component] && locks[component] != conn.id){
			return this.error(conn, 'acquire lock error', component);
		}
		if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
		this.acquireLock(server, conn, component);
		server.$timeouts[component] = setTimeout(this.releaseLock.bind(this, server, conn, component), 20000);
		return this;
	},

	acquireLock: function(server, conn, component){
		server.$locks[component] = conn.id;
		this.reply(conn, 'lock acquired', component);
		this.broadcast(conn, 'lock component', component);
		server.emit('componentLocked', server, component, conn.id);
		return this;
	},

	onReleaseLock: function(server, conn, component){
		if (server.$locks[component] != conn.id){
			return this.error(conn, 'release lock error', component);
		}
		return this.releaseLock(server, conn, component);
	},

	releaseLock: function(server, conn, component){
		var locks = server.$locks,
			timeouts = server.$timeouts;

		if (locks[component] == conn.id){
			if (timeouts[component]) clearTimeout(timeouts[component]);
			delete locks[component];
			delete timeouts[component];
			this.reply(conn, 'lock released', component);
			this.send(server, 'release component', component);
			server.emit('componentReleased', server, component, conn.id);
		}
		return this;
	},

	onClientDisconnect: function(server, conn){
		this.clearLocks(server, conn);
	},

	clearLocks: function(server, conn){
		for (var component in server.$locks){
			this.releaseLock(server, conn, component);
		}
		return this;
	}

};

})();

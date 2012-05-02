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

	onClientConnect: function(server, conn){
		conn.on('update', this.onStateUpdate.bind(this, server, conn));
		conn.on('acquire lock', this.onAcquireLock.bind(this, server, conn));
		conn.on('release lock', this.onReleaseLock.bind(this, server, conn));
		this.reply(conn, 'initial state', server.$state);
	},

	onStateUpdate: function(server, conn, data){
		if (data && data.component){
			if (server.$locks[data.component] && server.$locks[data.component] !== conn.id){
			//if ((!bypass && server.$locks[data.component] !== conn.id)
			//	|| (bypass && server.$locks[data.component])){
				return this.pushLockError(server, conn, data.component);
			}
			server.$state[data.component] = data.payload;
			return this.pushUpdate(server, conn, data);
		}
		return this.pushUpdateError(server, conn);
	},

	pushUpdate: function(server, conn, data){
		return this.send(server, 'state update', {
			component: data.component,
			payload: data.payload
		});
	},

	pushUpdateError: function(server, conn){
		return this.reply(conn, 'update error', null);
	},

	pushLockError: function(server, conn, component){
		return this.reply(conn, 'lock error', component);
	},

	onAcquireLock: function(server, conn, component){
		var locks = server.$locks;
		if (!locks[component] || locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.acquireLock(server, conn, component);
			server.$timeouts[component] = setTimeout(this.releaseLock.bind(this, server, conn, component), 20000);
		} else {
			this.acquireLockError(server, conn, component);
		}
		return this;
	},

	acquireLock: function(server, conn, component){
		server.$locks[component] = conn.id;
		this.reply(conn, 'lock acquired', component);
		this.broadcast(conn, 'lock component', component);
		server.emit('componentLocked', server, component, conn.id);
		return this;
	},

	acquireLockError: function(server, conn, component){
		this.reply(conn, 'acquire lock error', component);
		// owner: conn.id
		return this;
	},

	onReleaseLock: function(server, conn, component){
		var locks = server.$locks;
		if (locks[component] && locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.releaseLock(server, conn, component);
		} else {
			this.releaseLockError(server, conn, component);
		}
		return this;
	},

	releaseLock: function(server, conn, component){
		if (conn.id == server.$locks[component]){
			delete server.$locks[component];
			delete server.$timeouts[component];
			this.reply(conn, 'lock released', component);
			this.send(server, 'release component', component);
			server.emit('componentReleased', server, component, conn.id);
		}
		return this;
	},

	releaseLockError: function(server, conn, component){
		this.reply(conn, 'release lock error', component);
		// owner: conn.id
		return this;
	},

	onClientDisconnect: function(server, conn){
		this.clearLocks(server, conn);
	},

	clearLocks: function(server, conn){
		var session = conn.id,
			locks = server.$locks,
			timeouts = server.$timeouts;

		for (var component in locks){
			if (locks[component] == session){
				delete locks[component];
				delete timeouts[component];
				server.emit('componentReleased', server, component, conn.id);
			}
		}

		return this;
	}

};

})();

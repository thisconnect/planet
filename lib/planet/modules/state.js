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
		// owner: conn.id
		conn.emit('error', name, data);
		return this;
	},

	onClientConnect: function(server, conn){
		conn.on('update', this.onStateUpdate.bind(this, server, conn));
		conn.on('put', this.onPut.bind(this, server, conn));
		conn.on('delete', this.onDelete.bind(this, server, conn));
		conn.on('acquire lock', this.onAcquireLock.bind(this, server, conn));
		conn.on('release lock', this.onReleaseLock.bind(this, server, conn));
		this.reply(conn, 'initial state', server.$state);
	},

	onStateUpdate: function(server, conn, data){
		if (data && data.component && data.payload){
			if (server.$locks[data.component] && server.$locks[data.component] !== conn.id){
				return this.error(conn, 'lock error', data.component);
			}
			server.$state[data.component] = data.payload;
			return this.send(server, 'state update', data);
		}
		return this.error(conn, 'update error', data);
	},

	onPut: function(server, conn, data){
		for (var i in data){
			//if (data.hasOwnProperty(i)) 
			server.$state[i] = data[i];
		}
		this.send(server, 'put', data);
	},

	onDelete: function(server, conn, key){
		if (typeof key == 'string' && server.$state[key]){
			delete server.$state[key];
			this.releaseLock(server, conn, key);
		}
		//else for (var i in data){
		//	delete server.$state[i];
		//}
		return this.send(server, 'delete', key);
	},

	onAcquireLock: function(server, conn, component){
		var locks = server.$locks;
		if (!locks[component] || locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.acquireLock(server, conn, component);
			server.$timeouts[component] = setTimeout(this.releaseLock.bind(this, server, conn, component), 20000);
		} else {
			return this.error(conn, 'acquire lock error', component);
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

	onReleaseLock: function(server, conn, component){
		var locks = server.$locks;
		if (locks[component] && locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.releaseLock(server, conn, component);
		} else {
			return this.error(conn, 'release lock error', component);
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
				this.broadcast(conn, 'release component', component);
				server.emit('componentReleased', server, component, conn.id);
			}
		}

		return this;
	}

};

})();

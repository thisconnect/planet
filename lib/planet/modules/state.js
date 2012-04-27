(function(){

var State = exports.State = {

	register: function(server){
		server.$state = {};
		server.$locks = {};
		server.$timeouts = {};
	},

	push: function(server, conn, data, exclude){
		if (typeof data != 'string') data = JSON.stringify(data);
		if (conn && exclude){
			conn.broadcast.send(data);
		} else if (conn && !exclude){
			conn.send(data);
		} else {
			server.$socket.sockets.send(data);
		}
		return this;
	},

	onClientConnect: function(server, conn){
		this.pushInitial(server, conn);
	},

	pushInitial: function(server, conn){
		var data = JSON.stringify({
			type: 'initial_state',
			payload: server.$state
		});
		return this.push(server, conn, data);
	},

	onClientMessage: function(server, conn, type, data){
		switch (type){
			case 'attempt_update': return this.onStateUpdate(server, conn, data, true);
			case 'acquire_lock': return this.onAcquireLock(server, conn, data);
			case 'state_update': return this.onStateUpdate(server, conn, data);
			case 'release_lock': return this.onReleaseLock(server, conn, data);
		}
	},

	onStateUpdate: function(server, conn, data, bypass){
		if (data && data.payload.component){
			if ((!bypass && server.$locks[data.payload.component] !== conn.id)
				|| (bypass && server.$locks[data.payload.component])){
				return this.pushLockError(server, conn, data.payload.component);
			}
			server.$state[data.payload.component] = data.payload.payload;
			return this.pushUpdate(server, null, data);
		}
		return this.pushUpdateError(server, conn);
	},

	pushUpdate: function(server, conn, data){
		var message = {
			type: 'state_update',
			payload: {}
		};
		message.payload[data.payload.component] = data.payload.payload;
		return this.push(server, conn, message);
	},

	pushUpdateError: function(server, conn){
		var data = JSON.stringify({
			type: 'update_error',
			payload: null
		});
		return this.push(server, conn, data);
	},

	pushLockError: function(server, conn, component){
		return this.push(server, conn, {
			type: 'lock_error',
			payload: component
		});
	},

	onAcquireLock: function(server, conn, data){
		var locks = server.$locks,
			component = data.payload;
		if (!locks[component] || locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.acquireLock(server, component, conn);
			server.$timeouts[component] = setTimeout(this.releaseLock.bind(this, server, component, conn), 20000);
		} else {
			this.acquireLockError(conn, component, conn.id);
		}
		return this;
	},

	acquireLock: function(server, component, conn){
		server.$locks[component] = conn.id;
		this.push(null, conn, {
			type: 'lock_acquired',
			payload: component
		}).push(null, conn, {
			type: 'lock_component',
			payload: component
		}, true);
		server.emit('componentLocked', server, component, conn.id);
		return this;
	},

	acquireLockError: function(conn, component, owner){
		this.push(null, conn, {
			type: 'acquire_lock_error',
			payload: {
				component: component,
				owner: owner
			}
		});
		return this;
	},

	onReleaseLock: function(server, conn, data){
		var locks = server.$locks,
			component = data.payload;
		if (locks[component] && locks[component] == conn.id){
			if (server.$timeouts[component]) clearTimeout(server.$timeouts[component]);
			this.releaseLock(server, component, conn);
		} else {
			this.releaseLockError(conn, component, conn.id);
		}
		return this;
	},

	releaseLock: function(server, component, conn){
		if (conn.id == server.$locks[component]){
			delete server.$locks[component];
			delete server.$timeouts[component];
			this.push(null, conn, {
				type: 'lock_released',
				payload: component
			}).push(server, null, {
				type: 'release_component',
				payload: component
			});
			server.emit('componentReleased', server, component, conn.id);
		}
		return this;
	},

	releaseLockError: function(conn, component, owner){
		this.push(null, conn, {
			type: 'release_lock_error',
			payload: {
				component: component,
				owner: owner
			}
		});
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

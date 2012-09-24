# Planet



Server
------

	cd bin
	./planet # -nouse-idle-notification -expose-gc



Client
------

	var socket = io.connect('//127.0.0.1:8999');
	socket.on('connect', function(){
		var local = {};
		socket.once('get', function(data){
			local = data;
		});
		socket.on('post', function(key, value){
			local[key] = value;
			console.log(local);
		});
		socket.emit('post', 'time', new Date());
		socket.emit('post', 'color', '#00d');
	});


Browse the examples planet/examples/index.html
(Chrome does not allow Websockets from filesystem)


	var socket = ('//127.0.0.1:8999');
	socket.on('connect', function(){
		var local = {};
		socket.once('get', function(data){
			local = data;
		});
		socket.on('put', function(data){
			for (var key in data){
				local[key] = data[key];
			}
			console.log(local);
		});
		socket.emit('put', {
			color: 'white',
			time: new Date(),
			birds: {
				doves: 34,
				owls: 4,
				parrots: 3,
				penguins: 12
			}
		});
		socket.on('post', function(key, value){
			local[key[0]][key[1]] = value;
			console.log(local);
		});
		socket.emit('post', ['birds', 'penguins'], 13);
		socket.emit('post', ['birds', 'woodpeckers'], 5);
		socket.on('delete', function(key){
			delete local[key[0]][key[1]];
			console.log(local);
		});
		socket.emit('delete', ['birds', 'parrots']);
	});



Methods
-------

- *on(string, callback)*

- *once(string, callback)*

- *emit(string, data[, data])*

- *disconnect()*



Events
------

- *get(object)*

  Fired when handshake is successful and passes the current state.

- *put(object)*

  Fired when a put message is emitted by a client.

- *post(key, value)*

  Fired when a post message is emitted by a client. Key can be a string or an array (path).

- *delete(key)*

  Fired when a delete message is emitted by a client.



### Tests

	git submodule update --init --recursive

Open http://localhost:8999/tests/ in a browser OR

	node tests/runner.js

(you might have to set ulimit -n 1024 if you want to connect with more than 200 clients)



TODO
----

- namespace with `.of('/planet')`



#### Dependencies

  - [Socket.IO](http://socket.io/) 0.9.x
  - Optparse-js 1.0.3



#### Dev Dependencies
  - [Testigo](https://github.com/keeto/testigo)

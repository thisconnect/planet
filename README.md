# Planet


Install
-------

```bash
npm install planet -g
```


Server
------

```bash
planet # --host mydomain.com --port 8004
```

Client
------

```javascript
var socket = io.connect('//mydomain.com:8004'),
	local = {};

socket.on('connect', function(){
	socket.emit('get', function(data){
		local = data;
	});
	socket.on('post', function(key, value){
		local[key] = value;
		console.log(local);
	});
	socket.emit('post', 'time', new Date());
	socket.emit('post', 'color', '#00d');
});
```

Browse the examples planet/examples/index.html

```javascript
var socket = io.connect('//mydomain.com:8999'),
	local = {};

socket.on('connect', function(){
	socket.emit('get', function(data){
		local = data;
	});
	socket.on('put', function(data){
		for (var key in data){
			local[key] = data[key];
		}
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
	});
	socket.emit('post', ['birds', 'penguins'], 13);
	socket.emit('post', ['birds', 'woodpeckers'], 5);
	socket.on('delete', function(key){
		delete local[key[0]][key[1]];
	});
	socket.emit('delete', ['birds', 'parrots']);
});
```


Methods
-------

- *on(string, callback)*

- *once(string, callback)*

- *emit(string, data[, data, callback])*

  Emit: 'put', 'post', 'delete', 'remove', 'get' messages
  
	- *emit('get'[, key], callback*

	  Gets data from planet.

- *disconnect()*


Events
------

- *connect()*

  Fired when handshake is successful.

- *put(data)*

  Fired when a put message is emitted by a client.

- *post(key, value)*

  Fired when a post message is emitted by a client. Key can be a string or an array (path).

- *delete(key)*

  Fired when a delete message is emitted by a client.


### Tests

```bash
git submodule update --init --recursive
```

Run ./planet and run the tests from a server or cli

```bash
node tests/runner.js
```

### Benchmarks
```bash
node --stack_size=8192 planet # prevents exceeding maximum call stack size
```

(you might have to set ulimit -n 1024 if you want to connect with more than 200 clients)

```bash
node bench/run.js 127.0.0.1:8004
```


TODO
----

- namespace with `.of('/planet')`
- latency optimization
- remove hardcoded 220 client limit
- make io options configurable
- review cli api
- tests for cli
- cleanup error messages
- array api
- eventually use https://github.com/isaacs/nopt instead of optparse


#### Dependencies

- [Socket.IO](http://socket.io/) 0.9.x
- Optparse-js 1.0.x


#### Dev Dependencies

- [Testigo](https://github.com/keeto/testigo)

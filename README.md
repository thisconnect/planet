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
var socket = io.connect('//mydomain.com:8004');

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
```

Browse the examples planet/examples/index.html

```javascript
var socket = io.connect('//mydomain.com:8999');

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
```


Methods
-------

- *on(string, callback)*

- *once(string, callback)*

- *emit(string, data[, data])*

- *disconnect()*


Events
------

- *get(data)*

  Fired when handshake is successful, servers the current state.

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

(you might have to set ulimit -n 1024 if you want to connect with more than 200 clients)

```bash
node bench/run.js mydomain.com:8004
```


TODO
----

- swap put and post
- namespace with `.of('/planet')`
- latency optimization
- test for lot of data
- test for huge data packets
- remove hardcoded 220 client limit
- cleanup lib directory
- make io options configurable
- api split delete into remove and delete
- review cli api
- tests for cli


#### Dependencies

- [Socket.IO](http://socket.io/) 0.9.x
- Optparse-js 1.0.x


#### Dev Dependencies

- [Testigo](https://github.com/keeto/testigo)

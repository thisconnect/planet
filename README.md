# Planet

Collaboratively edit JSON-style data using 
[Socket.IO](https://github.com/LearnBoost/socket.io) by
synchronizing all modifications of an shared/planetary object.

Every client will receive all modifications in the exact order 
as they are incoming to the Planet server. This greatly simplifies
concurent editing and does not require locking nor OT.
This approach guarantees the exact same state on all clients
and has been proven to work reliably in other projects.
Planet is inspired by the [netpd](http://www.netpd.org/) approach.

Methods:
  - *post* - recursively merges any objects into the current state
  - *put* - sets data at a specific location
  - *remove* - deletes a property at given key (string) or path (array)
  - *get* - fetches a property at given key or path
  - *delete* - resets the current state and removes everything

Planet is optimized to edit structured data (nested objects, arrays, strings, numbers) 
and does not require to do [OT](http://en.wikipedia.org/wiki/Operational_transformation).
If you are looking for text editing have a look at 
[ShareJS](https://github.com/josephg/ShareJS).


Install
-------

```bash
npm install planet -g
```


Run
---

```bash
planet
# or
cd bin/
./planet
```

Client Examples
---------------

Run the server and browse planet/examples/


```javascript
var local = {},
	socket = io.connect('//mydomain.com:8080');

socket.on('connect', function(){
	// fetch the current state
	socket.emit('get', function(data){
		local = data;
	});

	// listen for any client putting data onto the planet
	socket.on('put', function(key, value){
		local[key] = value;
		console.log('the state has been modified', local);
	});

	// put data to all clients
	socket.emit('put', 'time', new Date());
	socket.emit('put', 'color', '#00d');

	// delete everything
	socket.emit('delete');
});
```

```javascript
var local = {},
	socket = io.connect('//mydomain.com:8080');

socket.on('connect', function(){
	socket.emit('get', function(data){
		local = data;
	});

	// listen to incoming objects
	socket.on('post', function(){
		for (var key in data){
			local[key] = data[key];
		}
	});

	// post an object
	socket.emit('post', {
		color: 'white',
		time: new Date(),
		birds: {
			doves: 34,
			owls: 4,
			parrots: 3,
			penguins: 12
		}
	});

	// expects key to be a path
	socket.on('put', function(key, value){
		local[key[0]][key[1]] = value;
	});

	// put data at specific path (array)
	socket.emit('put', ['birds', 'penguins'], 13);
	socket.emit('put', ['birds', 'woodpeckers'], 5);

	// listen for removeing keys
	socket.on('remove', function(key){
		delete local[key[0]][key[1]];
	});

	// removes a property at path (array)
	socket.emit('remove', ['birds', 'parrots']);
});
```


Client API
----------

Planet uses [Socket.IO](https://github.com/LearnBoost/socket.io) 
custom events to communicate with the planet server. 
Only the standard [Socket.IO-Client](https://github.com/LearnBoost/socket.io-client)
script is required on the client side. Client side deep mergining
has to be implemented manually at the moment. 

- *connect(uri, options)*

- *on(string, callback)*

  Client events: 'connect', 'disconnect'
  Planet custom events: 'post', 'delete', 'put', 'remove'

- *once(string, callback)*

  Same events as above

- *emit(string[, data, callback])*

  Emit custom methods: 'post', 'get', 'delete', 'put', 'remove'

- *disconnect()*


Client Events
-------------

Standard Socket.IO events.

- *connect()*

  Fired when handshake is successful.

- *disconnect()*

  Fired when the client disconnects.


Custom Events/Methods
---------------------

List of commands that are both:
  - Methods that are sent via emit()
  - Events that are subscribed with on()/once()

Every connected client will receive the all commands in exactly the same order.
This includes the client that is emitting the command.

- *post(object)*

  Sends an object and recursively merges it into the current state. 
  Arrays are not treated as objects and will not be merged.

- *put(key/path, data)*

  Puts data (strings, numbers, array, objects) at a given key (string) or path (array).
  The value will overwrite the current data and not be merged.

- *remove(key/path)*

  Removes a property at given key (string) or path (array).

- *delete()*

  Deletes the complete state.


Custom Methods
--------------

- *get([key/path, ]callback(data))*

  Asynchronously fetches a data at key (string) or path (array).
  Returns the whole state if no key is omitted.


### Tests

```bash
git submodule update --init --recursive
```

Run ./planet and run the tests from a server or cli

```bash
node tests/run.js
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

- strict (option for disallowing auto-creation of putting keys)
- predefined model (option for predefining a data structure 
  and disalow posting/putting inexistent keys)
- latency optimization
- review cli api
- tests for cli
- cleanup error messages
- eventually use https://github.com/isaacs/nopt instead of optparse
- eventually provide a client side script for merge, get and set modification


#### Dependencies

- [Socket.IO](http://socket.io/) 0.9.x
- Optparse-js 1.0.x


#### Dev Dependencies

- [Testigo](https://github.com/keeto/testigo)



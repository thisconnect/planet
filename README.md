# Planet

Collaboratively edit JSON-style data using 
[Socket.IO](https://github.com/LearnBoost/socket.io) by
synchronizing all operations on a planetary shared object.

All connected clients will receive each operation in
exactly the same order as they are incoming to the Planet server.
This approach guarantees the exact same state on all clients
and has been proven to work reliably in other projects such as
[netpd](http://www.netpd.org/).

Operations:

  - `put` - sets a property at location key (string) or path (array)

  - `remove` - deletes a property at given location

  - `post` - recursively merges an object into the current state

  - `delete` - removes everything

  - `get` - fetches a property at given location

Planet is optimized to edit structured data (nested objects,
arrays, strings, numbers, booleans) and does not require  
[OT](http://en.wikipedia.org/wiki/Operational_transformation).
If you are looking for text editing have a look at 
[ShareJS](https://github.com/josephg/ShareJS).



Example
-------

```javascript
// server
var planet = require('planet'),
	socket = require('socket.io').listen(8080);

new planet(socket);

// client
var io = require('socket.io-client');

// user 1
io.connect('//:8080')
	.on('put', function(key, value){
		console.log(key, value);
		// 'sugar' 1
		// 'milk' 0
	})
	.on('post', function(data){
		console.log(data);
		// {'sugar': 1, 'milk': 0}
	});

// user 2	
io.connect('//:8080', {'force new connection': true})
	.on('connect', function(){
		this.emit('post', {
			'sugar': 1,
			'milk': 0
		});

		this.emit('put', 'sugar', 2);
		this.emit('put', 'milk', 100);

		this.emit('get', function(data){
			console.log(data);
			// {'sugar': 2, 'milk': 100}
		});
	});
```



Planet Events
-------------

Events are fired on both the server and the client side.
Each operation will be received in exactly the same
order as they are incoming to the server. This includes the client
that is emitting the operation. See also a list of available
[Socket.IO Events](https://github.com/LearnBoost/socket.io/wiki/Exposed-events).



### Event: put

Fires when a value (string, number, array, object, boolean)
is put at a given location, key (string) or path (array).
The value will overwrite the location and not be merged.

```js
earth.on('put', function(key, value){ });
```

##### Arguments:

1. Key (string or array) - the location to put the value.
2. Value (string, number, object, array, boolean, null).



### Event: remove

Removes a property at given location.

```js
earth.on('remove', function(key){ });
```

##### Arguments:

1. Key (string or array) - the property to remove.



### Event: post

Fires when an object is merged into the current state. 
Arrays are not treated as objects and will not be merged.

```js
earth.on('post', function(data){ });
```

##### Arguments:

1. Data (object) - the object to merge into the current state.



### Event: delete

Deletes the complete state.

```js
earth.on('delete', function(){ });
```



Client API
----------

Planet uses [Socket.IO](https://github.com/LearnBoost/socket.io) 
custom events to communicate with the planet server. Only the standard
[Socket.IO-Client](https://github.com/LearnBoost/socket.io-client)
script is required on the client side.

### Browser
```html
<script src="//localhost:8080/socket.io/socket.io.js"></script>
```

### Node.js
```js
var io = require('socket.io-client');
```



### Method: connect

Connects to the planet.

```js
var earth = io.connect('//:8080', options);
```

##### Arguments:

1. URI (string) - the location to remove.
2. Options (object) - See 
[Socket.IO-Client](https://github.com/LearnBoost/socket.io-client).



### Method: disconnect

Disconnects from the planet.

```js
earth.disconnect();
```



### Method: on

Adds a listener.

```js
earth.on('remove', function(key){ });
```

#### Arguments:

1. Event (string) - the operation to listen to.
2. Callback (function).



### Method: once

Adds a one time listener, which is removed after 
the first time the event is fired.

```js
earth.once('put', function(key, value){ });
```

#### Arguments:

1. Event (string) - the operation to listen to.
2. Callback (function).



### Method: emit

Emits planet operations: 'put', 'remove', 'post', 'delete', 'get'

```js
earth.emit('post', {'bag': {'eggs': 6, 'milk': 100}});
earth.emit('post', {'bag': {'sugar': 20}});
earth.emit('put', ['bag', 'eggs'], 5);
earth.emit('remove', ['bag', 'milk']);
earth.emit('get', 'bag', function(data){
	console.log(data);
	// {'bag': {'eggs': 5, 'sugar': 20}}
	earth.emit('delete');
});
```



### Emit: post

Merges an object into the current state.

```js
earth.emit('post', {'key': 'value'});
```



### Emit: put

Sets a property at location key (string) or path (array)

```js
earth.emit('put', 'bag', {'sugar': 20});
earth.emit('put', ['bag', 'eggs'], 12);
```



### Emit: remove

Deletes a property at given location.

```js
earth.emit('remove', 'key');
earth.emit('remove', ['bag', 'eggs']);
```



### Emit: delete

Deletes everything.

```js
earth.emit('delete');
```



### Emit: get

Asynchronously fetches data, optionally at location
key (string) or path (array). Returns the whole state
if key is omitted.

```js
earth.emit('get', function(data){ });
earth.emit('get', 'bag', function(value){ });
earth.emit('get', ['bag', 'eggs'], function(value){ });
```



### Events

All Planet Events (see above) are available on the client
side as well as the
[Socket.IO Client Events](https://github.com/LearnBoost/socket.io-client).



Server API
----------

Require Socket.IO

```js
var Planet = require('planet'),
	socket = require('socket.io').listen(8080, 'localhost');
```



### Constructor: Planet

```js
var earth = new Planet(socket, options);
```

The `new` keyword is optional.

##### Arguments:

1. Socket (io) - the socket.io instance returned from io.listen().
2. Options (object) - the configuration object.

##### Options:

  - `limit` - the maximum amount of concurent client connections.
  Defaults to 200



### Method: post

Merges an object into the current state.

```js
earth.post({'key': 'value'});
```



### Method: put

Sets a property at location key (string) or path (array)

```js
earth.put('bag', {'sugar': 20});
earth.put(['bag', 'eggs'], 12);
```



### Method: remove

Deletes a property at given location.

```js
earth.remove('key');
earth.remove(['bag', 'eggs']);
```



### Method: delete

Deletes everything.

```js
earth.del();
```



### Method: get

Asynchronously fetches data, optionally at location
key (string) or path (array). Returns the whole state
if key is omitted.

```js
earth.get(function(data){ });
earth.get('bag', function(value){ });
earth.get(['bag', 'eggs'], function(value){ });
```



### Events

All Planet Events (see above) are available on the server
as well as the
[Socket.IO Events](https://github.com/LearnBoost/socket.io/wiki/Exposed-events).



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


### Tests

```bash
git submodule update --init --recursive // install Testigo

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
- cleanup error messages
- eventually use https://github.com/isaacs/nopt instead of optparse
- eventually provide a client side script for merge, get and set manipulation


#### Dependencies

- [Socket.IO](http://socket.io/) 0.9.x
- Optparse-js 1.0.x


#### Dev Dependencies

- [Testigo](https://github.com/keeto/testigo)



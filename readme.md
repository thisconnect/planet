# Planet

Collaboratively edit JSON-style data in realtime using 
[Socket.IO](https://github.com/LearnBoost/socket.io) by
synchronizing all operations on a planetary shared object.
Each operation will be received in exactly the same
order as they are incoming to the Planet server. 
This includes the client that is emitting the operation.
This approach guarantees the exact same state on all clients
and has been proven to work reliably in other projects such as
[netpd](http://www.netpd.org/).

Planet is optimized to edit JSON style data and does not require
[OT](http://en.wikipedia.org/wiki/Operational_transformation).
If you are looking for rich text editing have a look at 
[ShareJS](https://github.com/josephg/ShareJS).



Example
-------

### Server

```javascript
var planet = require('planet'),
	socket = require('socket.io').listen(8080);

planet(socket);
```

### CLI

```bash
planet --host localhost --port 8080
```


### Client

```javascript
io.connect('//:8080')
.on('connect', function(){
	this.emit('merge', {
		'sugar': 1,
		'milk': 0
	});

	this.on('set', function(key, value){
		console.log(key, value);
		// sugar 2
		// milk 100
	});

	this.emit('set', 'sugar', 2);
	this.emit('set', 'milk', 100);

	this.emit('get', function(data){
		console.log(data);
		// {'sugar': 2, 'milk': 100}
	});
});
```



Or run the example with:

```bash
node test/example
```


### Operations

  - `set` - Sets a value at a specific location.
    The value will be overwritten, not merged!

  - `remove` - Deletes a value at a specified location.

  - `merge` - Recursively merges data into the state.

  - `delete` - Deletes the state.

  - `get` - Asynchronously fetches values from the state,
    optionally at a specified location. Returns the whole
	state if no location is passed.



### Terminology

  - `operation` - The custom events that is used to
    modify the planetary shared object.

  - `value` - Can be of type string, number, object,
    array, boolean or null.

  - `location` - Specifies a property of the shared object
    by a key (string) or path (array).

  - `path` - A path is an array of strings or/and numbers
    to specify a property in an object. Numbers refer to
	element positions of arrays.

  - `data` - Refers always to an object.

  - `state` - The current content of the planet
    that can be manipulated by the operations or
	read with `get`.



### Arrays

Arrays are not treated as objects and will not be merged
by `merge` operations. The elements of an array can be
`set` or fetched by `get` opernations. Removing single
elements from an array is not yet specified.



### String

Single characters of a string value can be manipulated
with `set` or read with `get`.



Install
-------

```bash
npm install planet
```


Include the Client
------------------



```html
<script src="//localhost:8080/socket.io/socket.io.js"></script>
```



```js
// or within Node.js 
var io = require('socket.io-client');
```



Events
------

Planet Operations are fired as Socket.IO custom events.
The operations can be listened on both the server and the client
via `on` and `once`.



### Event: set

```js
client.on('set', function(location, value){ });
```



### Event: remove

```js
client.on('remove', function(location){ });
```



### Event: merge

```js
client.on('merge', function(data){ });
```



### Event: delete

```js
client.on('delete', function(){ });
```



Client API
----------



### Method: connect

```js
var earth = io.connect('//:8004', options);
```



### Method: disconnect

```js
earth.disconnect();
```



### Method: emit

Emits Planet operations.



### Emit: set

```js
earth.emit('set', 'bag', null); // {'bag': null}
earth.emit('set', 'bag', {'sugar': 20}); // {'bag': {'sugar': 20}}
earth.emit('set', ['bag', 'eggs'], 12); // {'bag': {'sugar': 20, 'eggs': 12}}
earth.emit('set', ['todo-list', 0], 'My first thing todo');
```



### Emit: remove

```js
earth.emit('remove', 'key');
earth.emit('remove', ['bag', 'eggs']);
```



### Emit: merge

```js
earth.emit('merge', {'bag': {'eggs': 6, 'milk': 100}});
earth.emit('merge', {'bag': {'sugar': 20}});
```



### Emit: delete

```js
earth.emit('delete');
```



### Emit: get

```js
earth.emit('get', function(data){ });
earth.emit('get', 'bag', function(value){ });
earth.emit('get', ['bag', 'eggs'], function(value){ });
earth.emit('get', ['todo-list', 0], function(value){ });
```



Server API
----------

```js
var Planet = require('planet'),
	socket = require('socket.io').listen(8080, 'localhost');
```



### Constructor: Planet

```js
var earth = new Planet(socket, options);
```

The `new` keyword is optional.

##### Arguments

1. Socket - Socket.IO socket server.
2. Options (object) - the configuration object.

##### Options

  - `limit` - the maximum amount of concurrent client connections.
  Defaults to 200.



### Method: merge

```js
earth.merge({'key': 'value'});
```



### Method: set

```js
earth.set('bag', {'sugar': 20});
earth.set(['bag', 'eggs'], 12);
earth.set(['todo-list', 0], 'My first thing todo');
```



### Method: remove

```js
earth.remove('key');
earth.remove(['bag', 'eggs']);
```



### Method: delete

```js
earth.delete();
```



### Method: get

```js
earth.get(function(data){ });
earth.get('bag', function(value){ });
earth.get(['bag', 'eggs'], function(value){ });
earth.get(['todo-list', 0], function(value){ });
```



CLI API
-------

To run `planet` form a command-line interface install
Planet globally `npm install planet -g`
or `cd bin && ./planet`.



### CLI Options

  - `-p`, `--port [NUMBER]` - The port to bind to (default: 8004).

  - `-h`, `--host [STRING]` - The host to connect to (default: 127.0.0.1).

  - `-l`,  `--limit [NUMBER]` - Maximum concurrent client connections,
    a number lower than your ulimit (default: 200).

  - `--io.<configuration>` - 
  [Socket.IO configuration](https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO)
  for example:
    `--io.transports=websocket,htmlfile`
    `--no-io.browser-client-cache`
  Note the dot notation and that dashes after --io. will 
  be replaced by whitespace to match Socket.IO configs.

  - `-v`, `--version` - Prints the current version.

  - `--help` - Shows this help message.



Tests
-----

```make
#test server api
make test-server

#test client api
make test-client

#build browser test
make test-browser

#run test server
node test/server
```



Benchmarks
----------

```bash
node test/benchmark
```



TODO
----

- Strict (option for disallowing auto-creation of setting keys at new location)
- Predefined model (option for predefining a data structure 
  and disalow merging/setting inexistent keys)
- Latency optimization
- Cleanup error messages
- Eventually provide a client side script for merge, get and set manipulation



#### Dependencies

- [Socket.IO](http://socket.io/)
- [Yargs](https://npmjs.org/package/yargs)
- [Tool](https://github.com/thisconnect/tool)


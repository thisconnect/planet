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



### Terminology

  - `operation` - The custom events that can be used to
    modify the planetary shared object.

  - `value` - Can be of type string, number, object,
    array, boolean or null.

  - `location` - Is a property specified by a key (string) 
    or path (array).

  - `path` - A path is an array of strings to specify
    a property in an object. Additinally a path can
	contain numbers to refer to an element within an array.

  - `data` - Refers always to an object.

  - `state` - The current content of the planet
    that can be manipulated by the operations or
	read with `get`.



### Operations

  - `put` - Sets a value at a specific location.
    The value will be overwritten and not be merged.

  - `remove` - Deletes a value at specified location.

  - `merge` - Recursively merges data into the state.

  - `delete` - Deletes the state.

  - `get` - Asynchronously fetches values from the state,
    optionally at a specified location. Returns the whole
	state if no location is passed.



### Arrays

Arrays are not treated as objects and will not be merged
by `merge` operations. The elements of an array
can be individually fetched by `get` or set by `put`
opernations. Removing single elements from an array is
not yet specified.



### String

Single characters of a string value can be manipulated
with `put` or read with `get`.



Install
-------

```bash
npm install planet
```



Example
-------



### Server

```javascript
var planet = require('planet'),
	socket = require('socket.io').listen(8080);

new planet(socket);
```



### Client

```javascript
io.connect('//:8080')
.on('connect', function(){
	this.emit('merge', {
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


Include the Client
------------------



```html
<script src="//localhost:8080/socket.io/socket.io.js"></script>
```



```js
// or within Node.js 
var io = require('socket.io-client');
```



Client API
----------



### Method: connect

```js
var earth = io.connect('//:8004', options);
```

##### Arguments

1. URI (string)
2. Options (object) - the configuration object.



### Method: disconnect

```js
earth.disconnect();
```



### Method: on

Adds a listener for planet operations: `put`, `remove`, `merge`, `delete`, `get` and
the [Socket.IO Client Events](https://github.com/LearnBoost/socket.io-client#events).



### Method: once

Adds a one time listener, which is removed after 
the first time the event is fired.



### Method: emit

Emits the following Planet operations: `put`, `remove`, `merge`, `delete`, `get`.



### Emit: put

```js
earth.emit('put', 'bag', null); // {'bag': null}
earth.emit('put', 'bag', {'sugar': 20}); // {'bag': {'sugar': 20}}
earth.emit('put', ['bag', 'eggs'], 12); // {'bag': {'sugar': 20, 'eggs': 12}}
earth.emit('put', ['todo-list', 0], 'My first thing todo');
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

Requires a Socket.IO socket.

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

1. Socket - socket server.
2. Options (object) - the configuration object.

##### Options

  - `limit` - the maximum amount of concurent client connections.
  Defaults to 200.



### Method: on

Adds a listener for Planet operations: `put`, `remove`, `merge`, `delete`, `get`.
See also the standard 
[Socket.IO Server Events](https://github.com/LearnBoost/socket.io/wiki/Exposed-events).



### Method: once

Adds a one time listener, which is removed after 
the first time the event is fired.



### Method: merge

```js
earth.merge({'key': 'value'});
```



### Method: put

```js
earth.put('bag', {'sugar': 20});
earth.put(['bag', 'eggs'], 12);
earth.put(['todo-list', 0], 'My first thing todo');
```



### Method: remove

```js
earth.remove('key');
earth.remove(['bag', 'eggs']);
```



### Method: delete

```js
earth.del();
```



### Method: get

```js
earth.get(function(data){ });
earth.get('bag', function(value){ });
earth.get(['bag', 'eggs'], function(value){ });
earth.get(['todo-list', 0], function(value){ });
```


Planet Operations
-----------------

Operations are fired as Socket.IO custom events
on both the server and the client side.



### Event: put

```js
earth.on('put', function(key, value){ });
```

##### Arguments

1. Key (string or array) - the location to put a value.
2. Value (string, number, object, array, boolean, null).



### Event: remove

```js
earth.on('remove', function(key){ });
```

##### Arguments

1. Key (string or array) - the location to delete.



### Event: merge

```js
earth.on('merge', function(data){ });
```

##### Arguments

1. Data (object) - the object to merge into the current state.



### Event: delete

```js
earth.on('delete', function(){ });
```



CLI API
-------

To run Planet form a command-line interface install
Planet globally `npm install planet -g`
or `cd bin && ./planet`.



### CLI Options

  - `-p`, `--port [NUMBER]` - The port to bind to (default: 8004).

  - `--host [STRING]` - The host to connect to (default: 127.0.0.1).

  - `-l`,  `--limit [NUMBER]` - Maximum concurrent client connections,
    a number lower than your ulimit (default: 200).

  - `-h`, `--help` - Shows this help message.



Tests
-----

Running tests requires the installation of 
[Testigo](https://github.com/keeto/testigo).

```bash
git submodule update --init --recursive

node tests/run.js
```

```bash
git submodule update --init --recursive

node tests/run.js
```

### Benchmarks

Start the Planet.

```bash
node --stack_size=8192 planet # prevents exceeding maximum call stack size
```

Set `ulimit -n 1024` if you want to connect with more than 200 clients.

```bash
node bench/run.js 127.0.0.1:8004
```



TODO
----

- api change: put to set
- Strict (option for disallowing auto-creation of putting keys)
- Predefined model (option for predefining a data structure 
  and disalow merging/putting inexistent keys)
- Latency optimization
- Cleanup error messages
- Eventually use https://github.com/isaacs/nopt instead of optparse
- Eventually provide a client side script for merge, get and set manipulation



#### Dependencies

- [Socket.IO](http://socket.io/) 0.9.x
- Optparse-js 1.0.x



#### Dev Dependencies

- microtime 0.3.1
- [Testigo](https://github.com/keeto/testigo)



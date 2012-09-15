# Planet

Run
---

	cd bin
	./planet

Browse the examples planet/examples/index.html
(Chrome does not allow Websockets from filesystem)


### Tests

	git submodule update --init --recursive

Open http://localhost:8999/tests/ in a browser


Events
------

- *initial state(object)*

  Fired when handshake is successful and passes the current state.

- *put(object)*

  Fired when a put message is emitted by a client.

- *post(key, value)*

  Fired when a post message is emitted by a client. Key can be a string or an array (path).

- *get(object)*

  Fired on connection and passes a dump of the current state.

- *delete(key)*

  Fired when a delete message is emitted by a client.


#### Dependencies

  - [Socket.IO](http://socket.io/) 0.9.x
  - Optparse-js 1.0.3


#### Dev Dependencies
  - [Testigo](https://github.com/keeto/testigo)

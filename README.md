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

- *initial state(data)*

  Fired when handshake is successful and passes the current state.

- *put(data)*

  Fired when a put message is emitted by a client

- *post(data)*

  Fired when a post message is emitted by a client

- *delete(key)*

  Fired when a delete message is emitted by a client


#### Dependencies

  - [Socket.IO](http://socket.io/) 0.9.5
  - Optparse-js 1.0.3


#### Dev Dependencies
  - [Testigo](https://github.com/keeto/testigo)

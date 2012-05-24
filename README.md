# Planet

Warning
-------

Until 1.0.0 is released expect some API changes and a few more examples and tests!

Run
---

	cd bin
	./planet

- Browse the examples planet/examples/index.html
  (Chrome does not allow Websockets from filesystem)

### Tests

To run the tests you need [Testigo](https://github.com/keeto/testigo)

	git submodule update --init --recursive

- Run the tests http://localhost:8999/tests/


Events
------

- *connect*

  Socket.IO event when handshake is successful.

- *disconnect*

  Socket.IO event when the connection is disconnected.

- *initial state(data)*

  Fired when handshake is successful and passes the current state.

- *put(data)*

  Fired when a put message is emitted by a client

- *post(data)*

  Fired when a post message is emitted by a client

- *delete(key)*

  Fired when a delete message is emitted by a client


#### Engine

  - Node.js 0.6.x


#### Dependencies

  - [Socket.IO](http://socket.io/) 0.9.5
  - Optparse-js 1.0.3


#### Dev Dependencies
  - [Testigo](https://github.com/keeto/testigo)

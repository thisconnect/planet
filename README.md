# Planet

Run
---

	cd bin
	./planet

- Run the tests http://localhost:8999/tests/
- Browse the examples planet/examples/index.html
  (Chrome does not allow Websockets from filesystem)


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


Engine
------

  - Node.js 0.6.x


#### Dependencies

  - Socket.IO 0.9.5
  - Optparse-js 1.0.3


#### Dev Dependencies
  - Testigo

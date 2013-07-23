var expect = require('expect.js');

var planet = require('../../'),
	http = require('http'),
	io = require('socket.io');


describe('Planet Server API: Constructor', function(){

	it('should start new planet', function(done){

		var server = http.createServer(),
			socket = io.listen(server, {'log level': 1});

		var mercury = new planet(socket);
		expect(mercury.version).to.be.a('string');

		server.listen(8101, '127.0.0.1');

		mercury.on('listening', function(location, port){
			expect(mercury).to.be.a(planet);
			expect(this).to.be.a(planet);

			expect(location).to.be.a('string');
			expect(port).to.be.a('number');

			expect(location).to.be('127.0.0.1');
			expect(port).to.be(8101);

			mercury.destroy();
			server.close();
			done();
		});

	});

	it('should create a new instance when called without the `new` operator', function(done){

		var server = http.createServer(),
			socket = io.listen(server, {'log level': 1});

		var venus = planet(socket);

		expect(venus).to.be.a(planet);

		server.listen(8102);

		venus.on('listening', function(location, port){
			expect(port).to.be(8102);
			venus.destroy();
			server.close();
			done();
		});
	});

	it('should start planet and connect with a client', function(done){

		var server = http.createServer(),
			socket = io.listen(server, {'log level': 1});

		var mars = planet(socket);

		expect(mars).to.be.a(planet);

		mars.on('listening', function(location, port){

			expect(port).to.be(8102);

			require('socket.io-client')
			.connect('//:8102', {
				'force new connection': true
			})
			.on('connect_failed', function(){
				console.log('connect_failed');
			})
			.on('connect', function(){
				this.disconnect();
			})
			.on('disconnect', function(){
				mars.destroy();
				server.close();
				done();
			});

		});

		server.listen(8102, 'localhost');
	});

	it('should start planet without a http server and connect with a client', function(done){

		var socket = io.listen(8103, {'log level': 1});

		planet(socket)
			.on('listening', function(location, port){
				expect(port).to.be(8103);
				require('socket.io-client')
					.connect('//:8103', {
						'force new connection': true
					})
					.on('connect', function(){
						this.disconnect();
					});
			})
			.on('connection', function(socket){
				expect(socket).to.be.an('object');
			})
			.on('disconnect', function(socket){
				expect(socket).to.be.an('object');
				this.destroy();
				done();
			});
	});


	it('should run the readme.md example', function(done){
		// server
		var planet = require('../../'),
			socket = require('socket.io').listen(8104, {
				'log level': 1
			});

		var venus = new planet(socket);

		var io = require('socket.io-client');

		// client 1
		io.connect('//:8104')
			.on('set', function(key, value){
				// console.log(key, value);
			})
			.on('merge', function(data){
				// console.log(data);
				expect(data).to.only.have.keys('sugar', 'milk');
				expect(data).to.have.property('sugar', 1);
				expect(data).to.have.property('milk', 0);
				this.disconnect();
			});

		// client 2	
		io.connect('//:8104', {'force new connection': true})
			.on('connect', function(){
				this.emit('merge', {
					sugar: 1,
					milk: 0
				});

				this.emit('set', 'sugar', 2);
				this.emit('set', 'milk', 100);

				this.emit('get', function(data){
					// console.log(data);
					expect(data).to.have.property('sugar', 2);
					expect(data).to.have.property('milk', 100);
					this.disconnect();
				});
			})
			.on('disconnect', function(){
				venus.destroy();
				socket.server.close();
				done();
			});

	});


	it('should return planet cli help', function(done){

		var exec = require('child_process').exec;

		exec(__dirname + '/../../bin/planet --help', function(error, stdout, stderr){
			expect(error).to.be(null);
			expect(stderr).to.match(/Usage:/);
			expect(stderr).to.match(/Options:/);
			done();
		});

	});


	it('should start planet from cli', function(done){

		var spawn = require('child_process').spawn;

		var child = spawn('./bin/planet', ['--port', 8105]);

		child.stdout.on('data', function(data){
			data = data.toString();
			expect(data).to.match(/Planet started/);
			expect(data).to.match(/8105/);
			child.kill();
			done();
		});

		child.stderr.on('data', function(error){
			console.log('error', error.toString());
		});

	});


	it('should start 2 namespaced planets', function(done){

		var client = require('socket.io-client');

		var socket = io.listen(8106, {
			'log level': 1
		});
		
		planet(socket.of('/foo'))
			.on('connection', function(){})
			.on('set', function(key, value){
				expect(value).to.be('foo');
			});
		
		planet(socket.of('/bar'))
			.on('connection', function(){})
			.on('set', function(key, value){
				expect(value).to.be('bar');
			});

		client.connect(':8106/foo')
			.on('connect', function(){
				this.emit('get', function(data){
					expect(data).to.be.an('object');
					expect(data).to.be.empty();
				});
				this.on('set', function(key, value){
					expect(value).to.be('foo');
				});
				this.emit('set', 'i am', 'foo');
				this.emit('get', function(data){
					expect(data).to.be.an('object');
					expect(data).to.eql({'i am': 'foo'});
				});
				this.disconnect();
			});

		client.connect(':8106/bar')
			.on('connect', function(){
				this.emit('get', function(data){
					expect(data).to.be.an('object');
					expect(data).to.be.empty();
				});
				this.on('set', function(key, value){
					expect(value).to.be('bar');
				});
				this.emit('set', 'i am', 'bar');
				this.emit('get', function(data){
					expect(data).to.be.an('object');
					expect(data).to.eql({'i am': 'bar'});
				});
				this.disconnect();
				done();
			});

	});

});

var expect = require('expect.js');

var planet = require('../../'),
	io = require('socket.io');


describe('Planet Server API: Events', function(){

	it('should receive events sent by client', function(done){

		var earth = planet(io.listen(8201, {
			'log level': 1
		}));

		//expect(earth).to.be.an(require('events').EventEmitter);

		earth.on('listening', function(){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
		});

		earth.on('connection', function(socket){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
		});

		earth.on('merge', function(data){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
			expect(data).to.be.an('object');
		});

		earth.on('set', function(key, value){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
			expect(key).to.be.an('array');
			expect(key).to.eql(['bag', 'milk']);
			expect(value).to.be.a('number');
			expect(value).to.be(2);
		});

		earth.on('remove', function(key){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
			expect(key).to.be.an('array');
			expect(key).to.eql(['bag', 'eggs']);

			earth.get('bag', function(data){
				expect(data).to.eql({'milk': 2});
			});
		});

		earth.on('delete', function(){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);

			earth.get(function(data){
				expect(data).to.eql({});
			});
		});

		earth.on('disconnect', function(socket){
			expect(this).to.be.a(planet);
			expect(this).to.be(earth);
			expect(socket).to.be.an('object');
			earth.destroy();
			done();
		});

		// client
		var client = require('socket.io-client')
			.connect('//:8201', {
				'force new connection': true
			});

		client.on('connect', function(){

			client.emit('merge', {
				bag: {
					milk: 1,
					eggs: 6
				},
				box: [1, 2, 3, 4, 5, 6]
			});

			client.on('merge', function(data){
				client.emit('set', ['bag', 'milk'], 2);
			});

			client.on('set', function(key, data){
				client.emit('remove', ['bag', 'eggs']);
			});

			client.on('remove', function(key){
				client.emit('delete');
			});

			client.on('delete', function(){
				client.disconnect();
			});
		});

	});

	it('should receive events sent by server', function(done){

		var earth = planet(io.listen(8202, {
			'log level': 1
		}));

		earth.on('listening', function(){

			// test on the client
			var client = require('socket.io-client')
				.connect('//:8202', {
					'force new connection': true
				});

			client.on('connect', function(){

				client.on('merge', function(data){
					expect(data).to.be.an('object');
				});

				client.on('set', function(key, value){
					expect(key).to.be.an('array');
					expect(value).to.be.a('number');
					expect(key).to.eql(['bag', 'eggs']);
					expect(value).to.be(4);
				});

				client.on('remove', function(key){
					expect(key).to.be.an('array');
					expect(key).to.eql(['bag', 'milk']);
				});

				client.on('delete', function(){
					client.emit('get', function(data){
						expect(data).to.be.empty();
						client.disconnect();
					});
				});
			});

			// test on the server
			earth.on('merge', function(data){
				expect(data).to.be.an('object');
			});

			earth.on('set', function(key, value){
				expect(key).to.be.an('array');
				expect(value).to.be.a('number');
				expect(key).to.eql(['bag', 'eggs']);
				expect(value).to.be(4);
			});

			earth.on('remove', function(key){
				expect(key).to.be.an('array');
				expect(key).to.eql(['bag', 'milk']);
			});

			earth.on('delete', function(){
				earth.get(function(data){
					expect(data).to.be.empty();
				});
			});

		});

		// server
		earth.on('connection', function(socket){
			earth.merge({
				'bag': {
					'milk': 3,
					'eggs': 5
				},
				'box': [6, 7]
			});
			earth.set(['bag', 'eggs'], 4);

			earth.on('remove', function(){
				earth.get(function(data){
					expect(data).to.eql({
						'bag': {'eggs': 4},
						'box': [6, 7]
					});
				});
				earth.get('bag', function(data){
					expect(data).to.eql({'eggs': 4});
					earth.delete();
				});
			});
			earth.remove(['bag', 'milk']);
		});

		earth.on('disconnect', function(socket){
			earth.destroy();
			done();
		});

	});

});

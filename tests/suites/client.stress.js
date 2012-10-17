if (!this.window) io = require('../../node_modules/socket.io/node_modules/socket.io-client');

exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet: Stress test', function(it){

	it('should `put` then `get` lots of data', function(expect){
		expect.perform(2);

		var first = io.connect('//:8999', {'force new connection': true});

		first.emit('delete');

		var local = {};

		for (var i = 0; i < 19999; i++){
			local[i] = Math.random();
		};

		first.on('connect', function(){
			first.emit('put', local);
		});

		first.on('put', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': true});

			second.on('get', function(data){
				expect(Object.keys(data).length).toBe(Object.keys(local).length);
				expect(data).toBeType('object');
				second.emit('delete');
			});

			second.on('delete', function(data){
				second.disconnect();
			});
		});
	});

/*
// ulimit -n 1024

[4, 8, 16, 32, 64, 128].forEach(function(amount){

	it('should `connect` ' + amount + ' clients then `disconnect`', function(expect){
		expect.perform(2);

		var sockets = [],
			count = 0;
		
		function connect(){
			var socket = io.connect('//:8999', {
				'force new connection': true,
				'try multiple transports': false,
				'reconnect': false
			});

			socket.on('connect', function(whot){
				if (++count == amount){
					expect(count).toBe(amount);
					for (var i = 0; i < amount; ++i){
						sockets[i].disconnect();
					};
				}
			});

			socket.on('disconnect', function(){
				if (--count == 0){
					expect(count).toBe(0);
				}
			});

			socket.on('error', function(msg){
				throw new Error('Planet error');
			});

			sockets.push(socket);

			setTimeout(function(){
				if (sockets.length < amount) connect();
			}, 0);
		}

		connect();
	});

});




	it('should `get` by key', function(expect){
		expect.perform(4);

		var first = io.connect('//:8999', {'force new connection': true});

		first.on('connect', function(){
			first.emit('put', { a: { b: { c: 0 } } });
		});

		first.on('put', function(data){
			this.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {'force new connection': true});

			second.emit('get', 'a', function(data){
				expect(data).toBeType('object');
				expect(data.b).toBeType('object');
				expect(data.b.c).toBeType('number');
				expect(data.b.c).toBe(0);
			});

			second.emit('get', 'b', function(data){
				expect(data).toBeNull();
				this.disconnect();
			});
		});
	});
*/

});

};

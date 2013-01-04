exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet: Stress Test', function(it){

	it('should `merge` and `get` get a big object', function(expect){
		expect.perform(2);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.emit('delete');

		var local = {};

		for (var i = 0; i < 19999; i++){
			local[i] = Math.random();
		};

		first.on('connect', function(){
			first.emit('merge', local);
		});

		first.on('merge', function(data){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(Object.keys(local).length <= Object.keys(data).length).toBe(true);
				expect(data).toBeType('object');
				second.emit('delete');
			});

			second.on('delete', function(data){
				second.disconnect();
			});
		});
	});


	it('should `put` many keys/values and `get` them all', function(expect){
		expect.perform(3);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.emit('delete');

		var i = 0,
			local = {},
			returned = {};

		first.on('connect', function(){
			var start = new Date().getTime();

			while (start + 100 >= new Date().getTime()){
				local['key-' + ++i] = Math.random();
				first.emit('put', 'key-' + i, local['key-' + i]);
			}
			console.log('\n...put', i, 'key/values during 100ms');
		});

		first.on('put', function(key, value){
			returned[key] = value;
			if ('key-' + i == key) first.disconnect();
		});

		first.on('disconnect', function(){
			var l = Object.keys(local).length;

			expect(Object.keys(returned).length).toBe(l);

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(l <= Object.keys(data).length).toBe(true);
				expect(data).toBeType('object');
				second.emit('delete');
			});

			second.on('delete', function(data){
				second.disconnect();
			});
		});
	});


[32, 64].forEach(function(amount){

	it('should `connect` ' + amount + ' clients then `disconnect`', function(expect){
		expect.perform(2);

		var sockets = [],
			count = 0;
		
		(function connect(){
			var socket = io.connect('//:8004', {
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
		})();

	});

});


});

};

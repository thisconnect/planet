var expect = require('expect.js');


describe('Planet: Stress Test', function(){

	this.timeout(10000);

	it('should `merge` and `get` get a big object', function(done){

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
				expect(Object.keys(local).length).to.be(Object.keys(data).length);
				expect(data).to.be.an('object');
				second.emit('delete');
			});

			second.on('delete', function(data){
				second.disconnect();
				done();
			});
		});
	});


	it('should `set` many keys/values and `get` them all', function(done){

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
				first.emit('set', 'key-' + i, local['key-' + i]);
			}
			console.log('\n...set', i, 'key/values during 100ms');
		});

		first.on('set', function(key, value){
			returned[key] = value;
			if ('key-' + i == key) first.disconnect();
		});

		first.on('disconnect', function(){
			var l = Object.keys(local).length;

			expect(Object.keys(returned)).to.have.length(l);

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(Object.keys(data).length).to.be(l);
				expect(data).to.be.an('object');
				second.emit('delete');
			});

			second.on('delete', function(data){
				second.disconnect();
				done();
			});
		});
	});


[64, 128].forEach(function(amount){

	it('should `connect` ' + amount + ' clients then `disconnect`', function(done){

		var sockets = [],
			count = 0;
		
		(function connect(){

			var socket = io.connect('//:8004', {
				'force new connection': true,
				'try multiple transports': false,
				'reconnect': false
			});

			socket.on('connect', function(){
				if (++count == amount){
					for (var i = 0; i < amount; ++i){
						sockets[i].disconnect();
					};
				}
			});

			socket.on('disconnect', function(){
				if (--count == 0){
					done();
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


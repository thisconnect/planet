var expect = require('expect.js');


describe('Planet Client API: Array', function(){


	it('should `get` an element from an array', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('merge', {
				'_a': ['a0', 'a1', 'a2'],
				'_b': {
					'bb': ['b0', 'b1', 'b2']
				},
				'_c': [['c0', 'c1', 'c2']],
				'_d': [{
					'dd': ['d0', 'd1', 'd2']
				}]
			});
		});

		socket.on('merge', function(){
			socket.emit('get', ['_a', 0], function(data){
				expect(data).to.be('a0');
			});
			socket.emit('get', ['_b', 'bb', 1], function(data){
				expect(data).to.be('b1');
			});
			socket.emit('get', ['_c', 0, 2], function(data){
				expect(data).to.be('c2');
			});
			socket.emit('get', ['_d', 0, 'dd', 0], function(data){
				expect(data).to.be('d0');
				socket.disconnect();
				done();
			});
		});
		
	});

	it('should `set` an element at the end of an array', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.once('connect', function(){
			socket.emit('set', '_add_array', ['a0', 'a1', 'a2']);
		});

		socket.once('set', function(){
			socket.once('set', function(){
				socket.emit('get', '_add_array', function(data){
					expect(data).to.be.an('array');
					expect(data[3]).to.be(null);
					expect(data[4]).to.be('a4');
					socket.disconnect();
					done();
				});
			});
			socket.emit('set', ['_add_array', 4], 'a4');
		});
		
	});


	it('should `set` an element to an array', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.emit('get', function(data){
			socket.emit('merge', {
				'_f': ['a1', 'a2', 'a3'],
				'_g': [['b1', 'b2'], ['b3', 'b4']],
				'_h': {
					'cc': ['cc1', 'cc2']
				},
				'_i': [{'dd': 'dd1'}, {'ddd': 'dd2'}],
				'_j': [{'ee': ['ee1']}]
			});
		});

		socket.on('merge', function(data){
			socket.emit('set', ['_f', 0], 'F1 (new)');
			socket.emit('set', ['_g', 0, 0], 'G1 (new)');
			socket.emit('set', ['_h', 'cc', 0], 'HH1 (new)');
			socket.emit('set', ['_i', 0, 'dd'], 'II1 (new)');
			socket.emit('set', ['_j', 0, 'ee', 0], 'JJ1 (new)');
			socket.emit('set', ['_j', 0, 'ee', 1], 'JJ2 (new)');

			socket.emit('get', ['_f', 0], function(data){
				expect(data).to.be('F1 (new)');
			});
			socket.emit('get', '_g', function(data){
				expect(data[0][0]).to.be('G1 (new)');
			});
			socket.emit('get', '_g', function(data){
				expect(data[0][0]).to.be('G1 (new)');
				expect(data[0][1]).to.be('b2');
				expect(data[1][0]).to.be('b3');
				expect(data[1][1]).to.be('b4');
			});
			socket.emit('get', ['_h', 'cc'], function(data){
				expect(data[0]).to.be('HH1 (new)');
			});
			socket.emit('get', ['_i', 0, 'dd'], function(data){
				expect(data).to.be('II1 (new)');
			});
			socket.emit('get', ['_i', 1, 'ddd'], function(data){
				expect(data).to.be('dd2');
			});
			socket.emit('get', ['_j', 0, 'ee', 0], function(data){
				expect(data).to.be('JJ1 (new)');
			});
			socket.emit('get', ['_j', 0, 'ee', 1], function(data){
				expect(data).to.be('JJ2 (new)');
				socket.disconnect();
				done();
			});
		});

		socket.on('error', function(type, key, value){
			console.log('\nerror', type, key, value);
		});

	});


	it('should `get` a single char from a string', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('merge', {
				'a string': '%is a string%'
			});
		});

		socket.on('merge', function(){
			socket.emit('get', ['a string', 0], function(data){
				expect(data).to.be('%');
			});
			socket.emit('get', ['a string', 1], function(data){
				expect(data).to.be('i');
				socket.disconnect();
				done();
			});
		});
		
	});


	it('should `set` a single char of a string', function(done){

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('delete');
			socket.emit('merge', {'a string': 'is a string'});
			socket.emit('set', ['a string', 1], 'n');
		});

		socket.on('set', function(){
			socket.emit('get', 'a string', function(string){
				expect(string).to.be('in a string');
			});
			socket.emit('get', ['a string', 1], function(data){
				expect(data).to.be('n');
			});
			socket.emit('get', function(data){
				expect(Object.keys(data)).to.have.length(1);
				socket.disconnect();
				done();
			});
		});
		
	});


});

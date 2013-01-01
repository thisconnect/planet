exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Array', function(it){


	it('should `get` an element from an array', function(expect){
		expect.perform(4);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.on('connect', function(){
			socket.emit('post', {
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

		socket.on('post', function(){
			socket.emit('get', ['_a', 0], function(data){
				expect(data).toBe('a0');
			});
			socket.emit('get', ['_b', 'bb', 1], function(data){
				expect(data).toBe('b1');
			});
			socket.emit('get', ['_c', 0, 2], function(data){
				expect(data).toBe('c2');
			});
			socket.emit('get', ['_d', 0, 'dd', 0], function(data){
				expect(data).toBe('d0');
				socket.disconnect();
			});
		});
		
	});


	it('should `put` an element to an array', function(expect){
		expect.perform(5);

		var socket = io.connect('//:8004', {
			'force new connection': true
		});

		socket.emit('get', function(data){
			socket.emit('post', {
				'_f': ['a1', 'a2', 'a3'],
				'_g': [['b1', 'b2'], ['b3', 'b4']],
				'_h': {
					'cc': ['cc1', 'cc2']
				},
				'_i': [{'dd': 'dd1'}, {'ddd': 'dd2'}],
				'_j': [{'ee': ['ee1']}]
			});
		});

		socket.on('post', function(data){
			socket.emit('put', ['_f', 0], 'F1 (new)');
			socket.emit('put', ['_g', 0, 0], 'G1 (new)');
			socket.emit('put', ['_h', 'cc', 0], 'HH1 (new)');
			socket.emit('put', ['_i', 0, 'dd'], 'II1 (new)');
			socket.emit('put', ['_j', 0, 'ee', 0], 'JJ1 (new)');

			socket.emit('get', ['_f', 0], function(data){
				expect(data).toBe('F1 (new)');
			});
			socket.emit('get', '_g', function(data){
				expect(data[0][0]).toBe('G1 (new)');
			});
			socket.emit('get', ['_h', 'cc'], function(data){
				expect(data[0]).toBe('HH1 (new)');
			});
			socket.emit('get', ['_i', 0, 'dd'], function(data){
				expect(data).toBe('II1 (new)');
			});
			socket.emit('get', ['_j', 0, 'ee', 0], function(data){
				expect(data).toBe('JJ1 (new)');
				socket.disconnect();
			});
		});

		socket.on('error', function(type, key, value){
			console.log('\nerror', type, key, value);
			// spy();
			// if (spy.getCallCount() >= 14) this.disconnect();
		});

		socket.on('disconnect', function(){
			
		});
	});



});

};

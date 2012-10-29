exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Array', function(it){


	it('should `get` an element from an array', function(expect){
		expect.perform(4);

		var socket = io.connect('//:8999', {
			'force new connection': true
		});

		socket.once('get', function(){
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
			});
			
		});
		
	});


	it('should `put` an element to an array', function(expect){
		expect.perform(4);

		var socket = io.connect('//:8999', {
			'force new connection': true
		});

		socket.once('get', function(){
			socket.emit('post', {
				'_a': ['a1', 'a2', 'a3'],
				'_b': [['b1', 'b2'], ['b3', 'b4']],
				'_c': {
					'cc': ['cc1', 'cc2']
				},
				'_d': [{'dd': 'dd1'}, {'ddd': 'dd2'}],
				'_e': [{'ee': ['ee1']}]
			});
		});

		socket.on('post', function(data){
			socket.emit('put', ['_a', 0], 'A1 (new)');
			socket.emit('put', ['_b', 0, 0], 'B1 (new)');
			socket.emit('put', ['_c', 'cc', 0], 'CC1 (new)');
			socket.emit('put', ['_d', 0, 'dd'], 'DD1 (new)');
			socket.emit('put', ['_e', 0, 'ee', 0], 'EE1 (new)');

			socket.send('test');
		});

		socket.on('message', function(msg){
			if (msg != 'test') return;

			socket.emit('get', ['_a', 0], function(data){
				expect(data).toBe('A1 (new)');
			});

			socket.emit('get', '_b', function(data){
				expect(data[0][0]).toBe('B1 (new)');
			});

			socket.emit('get', ['_c', 'cc'], function(data){
				expect(data[0]).toBe('CC1 (new)');
			});

			socket.emit('get', ['_d', 0, 'dd'], function(data){
				expect(data).toBe('DD1 (new)');
			});

			socket.emit('get', ['_e', 0, 'ee', 0], function(data){
				expect(data).toBe('EE1 (new)');
			});
		});

		socket.on('disconnect', function(){
			
		});
	});



});

};

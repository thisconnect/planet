exports.setup = function(Tests, io){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Delete', function(it){


	it('should delete everything', function(expect){
		expect.perform(4);

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('post', {
				'key-a': null,
				'key-b': ''
			});
		});

		first.on('post', function(data){
			first.emit('delete');
		});

		first.on('delete', function(){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).toBeType('object');
				expect(data).not.toHaveProperty('key-a');
				expect(data).not.toHaveProperty('key-b');
				expect(Object.keys(data).length).toBe(0);
				second.disconnect();
			});
		});
	});


});

};

exports.setup = function(Tests){

var Spy = require('../testigo/Source/lib/spy').Spy;


Tests.describe('Planet API: Delete', function(it){


	it('should delete everything', function(expect){
		expect.perform(4);

		var first = io.connect('//:8999', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('put', {
				'key-a': null,
				'key-b': ''
			});
		});

		first.on('put', function(data){
			first.emit('delete');
		});

		first.on('delete', function(){
			first.disconnect();
		});

		first.on('disconnect', function(){

			var second = io.connect('//:8999', {
				'force new connection': true
			});

			second.on('get', function(data){
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

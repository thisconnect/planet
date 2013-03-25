var expect = require('expect.js');


describe('Planet Client API: Delete', function(){

	it('should delete everything', function(done){

		var first = io.connect('//:8004', {
			'force new connection': true
		});

		first.on('connect', function(){
			first.emit('merge', {
				'key-a': null,
				'key-b': ''
			});
			first.emit('delete');
			first.disconnect();
		});


		first.on('disconnect', function(){

			var second = io.connect('//:8004', {
				'force new connection': true
			});

			second.emit('get', function(data){
				expect(data).to.be.an('object');
				expect(data).not.to.have.property('key-a');
				expect(data).not.to.have.property('key-b');
				expect(data).to.be.empty();
				expect(Object.keys(data)).to.have.length(0);
				second.disconnect();
				done();
			});
		});
	});

});

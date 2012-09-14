exports.setup = function(Tests){


Tests.describe('Planet API: Delete', function(it){

	it('should allow for delete object', function(expect){
		expect.perform(5);

		var first = io.connect(null, {'force new connection': 1});

		first.on('connect', function(){
			first.emit('put', {
				'key-d': 5,
				'key-e': 6
			});
		});

		first.on('put', function(data){
			first.emit('delete', 'key-d');
		});

		first.on('delete', function(data){
			expect(data).toBe('key-d');
			this.disconnect();
		});

		first.on('disconnect', function(data){

			var second = io.connect(null, {'force new connection': 1});

			second.on('get', function(data){
				expect(data).toBeType('object');
				expect('key-d' in data).toBeFalse();
				expect('key-e' in data).toBeTrue();
				expect(data['key-e']).toBe(6);
				this.disconnect();
			});
		});
		
		// TODO: delete by path
		// TODO: delte null
	});

});

};

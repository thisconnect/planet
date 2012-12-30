exports.setup = function(Tests){

var merge = require('../../lib/util').merge;

Tests.describe('Planet Utils: Merge', function(it){

	it('should be a function', function(expect){
		expect(merge).toBeType('function');
		expect({a: 1, b: 2}).toBeLike({a: 1}); // little bug in testigo
		expect({"a": 1}).toBeSimilar({a: 1}); // JSON comparison
	});

	it('should merge objects', function(expect){
		var r1 = merge({a: 0}, {a: 1}),
			r2 = merge({a: 1}, {a: 0});

		expect(r1).toBeLike({a: 1});
		expect(r2).toBeLike({a: 0});

		expect(r1).toBeSimilar({a: 1});
		expect(r2).toBeSimilar({a: 0});
	});

	it('should merge objects with different keys', function(expect){
		var r1 = merge({a: 0}, {b: 1}),
			r2 = merge({a: 1}, {b: 0});

		expect(r1).toBeLike({a: 0, b: 1});
		expect(r2).toBeLike({a: 1, b: 0});

		expect(r1).toBeSimilar({a: 0, b: 1});
		expect(r2).toBeSimilar({a: 1, b: 0});
	});

	it('should merge objects with different and indentical keys', function(expect){
		var r = merge({a: 1, b: 1}, {a: 0, c: 2});
		expect(r).toBeLike({a: 0, b: 1, c: 2});
		expect(r).toBeSimilar({a: 0, b: 1, c: 2});
	});

	it('should merge empty objects', function(expect){
		var r1 = merge({a: 0}, {}),
			r2 = merge({}, {a: 0});

		expect(r1).toBeLike({a: 0});
		expect(r2).toBeLike({a: 0});
		expect(r1).toBeSimilar({a: 0});
		expect(r2).toBeSimilar({a: 0});
	});

	it('should merge properties with a value of null', function(expect){
		var r1 = merge({a: 0}, {a: null}),
			r2 = merge({a: null}, {a: 0});

		expect(r1).toBeLike({a: null});
		expect(r2).toBeLike({a: 0});
		expect(r1).toBeSimilar({a: null});
		expect(r2).toBeSimilar({a: 0});
	});

	it('should merge properties with a value of false', function(expect){
		var r1 = merge({a: false}, {a: null}),
			r2 = merge({a: null}, {a: false});

		expect(r1).toBeLike({a: null});
		expect(r2).toBeLike({a: false});
		expect(r1).toBeSimilar({a: null});
		expect(r2).toBeSimilar({a: false});
	});

	// Arrays

	it('should treat arrays as values', function(expect){
		var r1 = merge({a: [2]}, {a: 1}),
			r2 = merge({a: 1}, {a: [2]});

		expect(r1).toBeLike({a: 1});
		expect(r2).toBeLike({a: [2]});
		expect(r1).toBeSimilar({a: 1});
		expect(r2).toBeSimilar({a: [2]});
	});

	it('should differenciate between arrays and objects', function(expect){
		var r1 = merge({a: [1, 2]}, {a: {b: 3}}),
			r2 = merge({a: {b: 3}}, {a: [1, 2]});

		expect(r1).toBeLike({a: {b: 3}});
		expect(r2).toBeLike({a: [1, 2]});
		expect(r1).toBeSimilar({a: {b: 3}});
		expect(r2).toBeSimilar({a: [1, 2]});
	});

	it('should not merge arrays', function(expect){
		var r1 = merge({a: [1, 2]}, {a: [3]}),
			r2 = merge({a: [3]}, {a: [1, 2]});

		expect(r1).toBeLike({a: [3]});
		expect(r2).toBeLike({a: [1, 2]});
		expect(r1).toBeSimilar({a: [3]});
		expect(r2).toBeSimilar({a: [1, 2]});
	});

	// Nesting

	it('should merge nested objects', function(expect){
		var r1 = merge({a: 1}, {a: {b: 2}}),
			r2 = merge({a: {b: 2}}, {a: 1});

		expect(r1).toBeLike({a: {b: 2}});
		expect(r2).toBeLike({a: 1});
		expect(r1).toBeSimilar({a: {b: 2}});
		expect(r2).toBeSimilar({a: 1});
	});

	it('should deep merge', function(expect){
		var r = merge({a: {b: 2}}, {a: {c: 3}});
		expect(r).toBeLike({a: {b: 2, c: 3}});
		expect(r).toBeSimilar({a: {b: 2, c: 3}});
	});

	it('should deep merge with empty objects', function(expect){
		var r1 = merge({a: {b: 2}}, {a: {}}),
			r2 = merge({a: {}}, {a: {b: 2}});

		expect(r1).toBeLike({a: {b: 2}});
		expect(r2).toBeLike({a: {b: 2}});
		expect(r1).toBeSimilar({a: {b: 2}});
		expect(r2).toBeSimilar({a: {b: 2}});
	});

	it('should treat empty objects as values', function(expect){
		var r1 = merge({a: 0}, {a: {}}),
			r2 = merge({a: {}}, {a: 0});

		expect(r1).toBeLike({a: {}});
		expect(r2).toBeLike({a: 0});
		expect(r1).toBeSimilar({a: {}});
		expect(r2).toBeSimilar({a: 0});
	});

	it('should merge deeper', function(expect){
		var o1 = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc2: 'o1cc2' }}},
			o2 = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc3: 'o2cc3' }}},
			e = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc2: 'o1cc2', cc3: 'o2cc3'}}};

		var r = merge(o1, o2);
		expect(r).toBeLike(e);
		expect(r).toBeSimilar(e);
	});

	it('should merge deeper II', function(expect){
		var o1 = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc2: 'o1cc2' }}},
			o2 = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc3: 'o2cc3' }}},
			e = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc3: 'o2cc3', cc2: 'o1cc2'}}};

		var r = merge(o2, o1);
		expect(r).toBeLike(e);
		expect(r).toBeSimilar(e);
	});

});

};

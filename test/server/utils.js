var expect = require('expect.js');

var merge = require('../../lib/util').merge;

describe('Planet Utils: Merge', function(){

	it('should be a function', function(){
		expect(merge).to.be.a('function');
	});

	it('should merge objects', function(){
		var r1 = merge({a: 0}, {a: 1}),
			r2 = merge({a: 1}, {a: 0});

		expect(r1).to.eql({a: 1});
		expect(r2).to.eql({a: 0});
	});

	it('should merge objects with different keys', function(){
		var r1 = merge({a: 0}, {b: 1}),
			r2 = merge({a: 1}, {b: 0});

		expect(r1).to.eql({a: 0, b: 1});
		expect(r2).to.eql({a: 1, b: 0});
	});

	it('should merge objects with different and indentical keys', function(){
		var r = merge({a: 1, b: 1}, {a: 0, c: 2});
		expect(r).to.eql({a: 0, b: 1, c: 2});
	});

	it('should merge empty objects', function(){
		var r1 = merge({a: 0}, {}),
			r2 = merge({}, {a: 0});

		expect(r1).to.eql({a: 0});
		expect(r2).to.eql({a: 0});
	});

	it('should merge properties with a value of null', function(){
		var r1 = merge({a: 0}, {a: null}),
			r2 = merge({a: null}, {a: 0});

		expect(r1).to.eql({a: null});
		expect(r2).to.eql({a: 0});
	});

	it('should merge properties with a value of false', function(){
		var r1 = merge({a: false}, {a: null}),
			r2 = merge({a: null}, {a: false});

		expect(r1).to.eql({a: null});
		expect(r2).to.eql({a: false});
	});

	// Arrays

	it('should treat arrays as values', function(){
		var r1 = merge({a: [2]}, {a: 1}),
			r2 = merge({a: 1}, {a: [2]});

		expect(r1).to.eql({a: 1});
		expect(r2).to.eql({a: [2]});
	});

	it('should differenciate between arrays and objects', function(){
		var r1 = merge({a: [1, 2]}, {a: {b: 3}}),
			r2 = merge({a: {b: 3}}, {a: [1, 2]});

		expect(r1).to.eql({a: {b: 3}});
		expect(r2).to.eql({a: [1, 2]});
	});

	it('should not merge arrays', function(){
		var r1 = merge({a: [1, 2]}, {a: [3]}),
			r2 = merge({a: [3]}, {a: [1, 2]});

		expect(r1).to.eql({a: [3]});
		expect(r2).to.eql({a: [1, 2]});
	});

	// Nesting

	it('should merge nested objects', function(){
		var r1 = merge({a: 1}, {a: {b: 2}}),
			r2 = merge({a: {b: 2}}, {a: 1});

		expect(r1).to.eql({a: {b: 2}});
		expect(r2).to.eql({a: 1});
	});

	it('should deep merge', function(){
		var r = merge({a: {b: 2}}, {a: {c: 3}});
		expect(r).to.eql({a: {b: 2, c: 3}});
	});

	it('should deep merge with empty objects', function(){
		var r1 = merge({a: {b: 2}}, {a: {}}),
			r2 = merge({a: {}}, {a: {b: 2}});

		expect(r1).to.eql({a: {b: 2}});
		expect(r2).to.eql({a: {b: 2}});
	});

	it('should treat empty objects as values', function(){
		var r1 = merge({a: 0}, {a: {}}),
			r2 = merge({a: {}}, {a: 0});

		expect(r1).to.eql({a: {}});
		expect(r2).to.eql({a: 0});
	});

	it('should merge deeper', function(){
		var o1 = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc2: 'o1cc2' }}},
			o2 = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc3: 'o2cc3' }}},
			e = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc2: 'o1cc2', cc3: 'o2cc3'}}};

		var r = merge(o1, o2);
		expect(r).to.eql(e);
	});

	it('should merge deeper II', function(){
		var o1 = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc2: 'o1cc2' }}},
			o2 = {c: {c1: false, c2: null, c3: {cc1: 'o2cc1', cc3: 'o2cc3' }}},
			e = {c: {c1: null, c2: false, c3: {cc1: 'o1cc1', cc3: 'o2cc3', cc2: 'o1cc2'}}};

		var r = merge(o2, o1);
		expect(r).to.eql(e);
	});

});

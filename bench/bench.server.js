var Benchmark = require('benchmark');

module.exports = function(planet, options){

	var maxTime = options.maxTime;
	
	return Benchmark.Suite()
	.on('cycle', function(cycle){
		console.log(String(cycle.target));
	})
	.add('Server.set - key string', {
		'maxTime': maxTime,
		'onStart': function(){
			console.log('Set:');
		},
		'fn': function(){
			planet.set('key', 'bar');
		}
	})
	.add('Server.set - path number', {
		'maxTime': maxTime,
		'fn': function(){
			planet.set(['a', 'b', 'c', 'd', 'e'], 2);
		}
	})
	.add('Server.set - key nested array', {
		'maxTime': maxTime,
		'fn': function(){
			planet.set('b', [[[[[2]]]]]);
		}
	})
	.add('Server.set - array path number', {
		'maxTime': maxTime,
		'fn': function(){
			planet.set(['b', 0, 0, 0, 0, 0], 3);
		}
	})
	.add('Server.merge - simple object', {
		'maxTime': maxTime,
		'onStart': function(){
			console.log('Merge:');
		},
		'fn': function(){
			planet.merge({ key: 'value'});
		}
	})
	.add('Server.merge - nested object', {
		'maxTime': maxTime,
		'fn': function(){
			planet.merge({ a: { b: { c: { d: { e: 0 } } } } });
		}
	})
	.add('Server.merge - complex object', {
		'maxTime': maxTime,
		'fn': function(){
			planet.merge({
				key: 'foo',
				a: { b: { c: { d: { e: 1 } } } },
				b: [[[[[1]]]]]
			});
		}
	})
	.add('Server.get - complete state', {
		'maxTime': maxTime,
		'defer': true,
		'onStart': function(){
			console.log('Get:');
		},
		'fn': function(deferred){
			planet.get(function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get - key', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get('key', function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get - path', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get(['a', 'b', 'c', 'd', 'e'], function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get - path array', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get(['b', 0, 0, 0, 0, 0], function(value){
				deferred.resolve();
			});
		}
	});

};

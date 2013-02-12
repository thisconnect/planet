var Benchmark = require('benchmark');

module.exports = function(client, options){
	
	var maxTime = options.maxTime;

	return Benchmark.Suite()
	.on('cycle', function(cycle){
		console.log(String(cycle.target));
	})
	.add('Client.emit.set - array path number', {
		'maxTime': maxTime,
		'defer': true,
		'onStart': function(){
			client.on('set', function(){
				client.deferred.resolve();
			});
		},
		'fn': function(deferred){
			client.deferred = deferred;
			client.emit('set', ['b', 0, 0, 0, 0, 0], 3);
		},
		'onComplete': function(){
			delete client.deferred;
			client.removeAllListeners('set');
		}
	})
	.add('Client.emit.merge - complex object', {
		'maxTime': maxTime,
		'defer': true,
		'onStart': function(){
			client.on('merge', function(){
				client.deferred.resolve();
			});
		},
		'fn': function(deferred){
			client.deferred = deferred;
			client.emit('merge', {
				key: 'foo',
				a: { b: { c: { d: { e: 1 } } } },
				b: [[[[[1]]]]]
			});
		},
		'onComplete': function(){
			delete client.deferred;
			client.removeAllListeners('merge');
		}
	})
	.add('Client.emit.get - path', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.emit('get', ['a', 'b', 'c', 'd', 'e'], function(){
				deferred.resolve();
			});
		}
	})
	.add('Client.emit.get - path array', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.emit('get', ['b', 0, 0, 0, 0, 0], function(value){
				deferred.resolve();
			});
		}
	});

};

var Benchmark = require('benchmark'),
	Planet = require('../'),
	socket = require('socket.io').listen(8082, {
		'log level': 1
	}),
	io = require('socket.io-client'),
	spawn = require('child_process').spawn;

var planet = Planet(socket);

var maxTime = 4;

planet.on('listening', function(){
	
	test()
	.on('complete', function(){
		var count = 0,
			dummies = spawn('node', [__dirname + '/dummies.js', 199, '//:8082']);

		process.on('exit', function(){
			dummies.kill();
		});
		dummies.stderr.on('data', function(error){ console.log('ERROR!!', error.toString()); });
		dummies.stdout.setEncoding('utf8');
		dummies.stdout.on('data', function(data){
			count += data.trim().split('\n').length;
			if (count < 199) return;
			console.log('connects 199 dummy clients');
			
			test()
			.on('complete', function(){
				planet.get(function(data){
					console.log(JSON.stringify(data));
					process.exit();
				});
			})
			.run();
		});
	})
	.run();
	
});


function test(){

	var client = io.connect('//:8082');

	return Benchmark.Suite()
	.on('cycle', function(cycle){
		console.log(String(cycle.target));
	})

	.add('Server.merge: simple object', {
		'maxTime': maxTime,
		'fn': function(){
			planet.merge({ key: 'value'});
		}
	})
	.add('Server.merge: nested object', {
		'maxTime': maxTime,
		'fn': function(){
			planet.merge({ a: { b: { c: { d: { e: 0 } } } } });
		}
	})
	.add('Server.merge: complex object', {
		'maxTime': maxTime,
		'fn': function(){
			planet.merge({
				key: 'foo',
				a: { b: { c: { d: { e: 1 } } } },
				b: [[[[[1]]]]]
			});
		}
	})

	.add('Server.put: key string', {
		'maxTime': maxTime,
		'fn': function(){
			planet.put('key', 'bar');
		}
	})
	.add('Server.put: path number', {
		'maxTime': maxTime,
		'fn': function(){
			planet.put(['a', 'b', 'c', 'd', 'e'], 2);
		}
	})
	.add('Server.put: key nested array', {
		'maxTime': maxTime,
		'fn': function(){
			planet.put('b', [[[[[2]]]]]);
		}
	})
	.add('Server.put: array path number', {
		'maxTime': maxTime,
		'fn': function(){
			planet.put(['b', 0, 0, 0, 0, 0], 3);
		}
	})

	.add('Server.get (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get(function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get key (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get('key', function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get path (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get(['a', 'b', 'c', 'd', 'e'], function(){
				deferred.resolve();
			});
		}
	})
	.add('Server.get path array (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			planet.get(['b', 0, 0, 0, 0, 0], function(value){
				deferred.resolve();
			});
		}
	})
	
	.add('Client.merge: complex object (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.once('merge', function(){
				deferred.resolve();
			});
			client.emit('merge', {
				key: 'foo',
				a: { b: { c: { d: { e: 1 } } } },
				b: [[[[[1]]]]]
			});
		}
	})
	.add('Client.put: array path number (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.once('put', function(){
				deferred.resolve();
			});
			client.emit('put', ['b', 0, 0, 0, 0, 0], 3);
		}
	})
	.add('Client.get path (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.emit('get', ['a', 'b', 'c', 'd', 'e'], function(){
				deferred.resolve();
			});
		}
	})
	.add('Client.get path array (async)', {
		'maxTime': maxTime,
		'defer': true,
		'fn': function(deferred){
			client.emit('get', ['b', 0, 0, 0, 0, 0], function(value){
				deferred.resolve();
			});
		}
	});


}

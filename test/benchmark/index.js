var Planet = require('../../'),
	socket = require('socket.io').listen(8082, {
		'log level': 1
	}),
	io = require('socket.io-client'),
	spawn = require('child_process').spawn;

var planet = Planet(socket, {
	limit: 100
});

planet.on('listening', function(){

	var client = io.connect('//:8082', {
		'force new connection': true
	});

	var options = {
		maxTime: 4
	};

	require('./bench.client')(client, options).on('complete', function(){

		client.disconnect();

		require('./bench.server')(planet, options).on('complete', function(){
			var count = 0,
				dummies = spawn('node', [__dirname + '/dummies.js', 99, '//:8082']);

			process.on('exit', function(){
				dummies.kill();
			});

			dummies.stderr.on('data', function(error){ console.log('ERROR!!', error.toString()); });
			dummies.stdout.setEncoding('utf8');
			dummies.stdout.on('data', function(data){
				count += data.trim().split('\n').length;
				if (count < 99) return;

				console.log('\n', 'Connect 99 dummy clients', '\n');

				client = io.connect('//:8082', {
					'force new connection': true
				});

				require('./bench.client')(client, options).on('complete', function(){

					client.disconnect();

					require('./bench.server')(planet, options).on('complete', function(){
						planet.get(function(data){
							// console.log(JSON.stringify(data));
							process.exit();
						});
					})
					.run();
				})
				.run();
			});
		})
		.run();
	})
	.run();

});

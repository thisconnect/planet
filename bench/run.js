var spawn = require('child_process').spawn;

process.chdir(__dirname);

var log = {
	storage: {},
	store: function(what, that){
		if (!(what in this.storage)) this.storage[what] = [];
		this.storage[what].push(that);
	},
	write: function(data){
		data = JSON.parse(data);
		for (key in data) this.store(key, data[key]);
	},
	read: function(){
		return this.storage;
	}
};

console.log('measure execution and response time');
spawn_story1(function(){
	console.log('first client done');
	spawn_story1(function(){
		console.log('time is measured relative to last action');
		spawn_story1(function(){
			console.log('spawning 200 dummy clients');
			spawn_dummies(200, function(){
				console.log('spawned 200 dummies');
				spawn_story1(function(){
					console.log('measure again but with 200 connected clients');
					spawn_story1(function(){
						console.log('almost done')
						spawn_story1(function(){
							console.log('first 3 results are single clients');
							console.log('last 3 results tested with 200 connected clients');
							console.log(log.read());
							process.exit(0);
						});
					});
				});
			});
		});
	});
});

function error(msg){
	console.log('ERROR', msg.toString().trim());
}

function spawn_story1(fn){
	var client = spawn('node', ['./client.js', process.argv[2] || '//:8004']);
	client.stderr.on('data', error);
	client.stdout.on('data', function(data){
		log.write(data);
		//story1.kill();
	});
	client.on('exit', function(code){
		if (typeof fn == 'function') fn(code);
	});
}

function spawn_dummies(amount, fn){
	var count = 0,
		dummies = spawn('node', ['./dummies.js', amount, process.argv[2] || '//:8004']);

	dummies.stderr.on('data', error);
	dummies.stdout.setEncoding('utf8');
	dummies.stdout.on('data', function(data){
		count += data.trim().split('\n').length;
		if (count < amount) return;
		if (typeof fn == 'function') fn();
	});
	
	process.on('exit', function(){
		dummies.kill();
	});
}

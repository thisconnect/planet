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

spawn_story1(function(){
	spawn_story1(function(){
		spawn_story1(function(){
			spawn_dummies(200, function(){
				spawn_story1(function(){
					spawn_story1(function(){
						spawn_story1(function(){
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
	var child = spawn('node', ['./story1.js']);
	child.stderr.on('data', error);
	child.stdout.on('data', function(data){
		log.write(data);
		//story1.kill();
	});
	child.on('exit', function(code){
		if (typeof fn == 'function') fn(code);
	});
}

function spawn_dummies(amount, fn){
	var count = 0,
		dummies = spawn('node', ['./dummies.js', amount]);

	dummies.stderr.on('data', error);
	dummies.stdout.setEncoding('utf8');
	dummies.stdout.on('data', function(data){
		count += data.trim().split('\n').length;
		if (count < amount) return;
		console.log('created', amount, 'dummy clients\n');
		if (typeof fn == 'function') fn();
	});
	
	process.on('exit', function(){
		dummies.kill();
	});
}

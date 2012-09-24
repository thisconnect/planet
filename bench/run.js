var spawn = require('child_process').spawn;

function error(msg){
	console.log('ERROR', msg.toString().trim());
}

function spawn_story1(fn){
	var child = spawn('node', ['./story1.js']);
	child.stderr.on('data', error);
	child.stdout.on('data', function(data){
		console.log(JSON.parse(data));
		console.log('\n');
		//story1.kill();
	});
	if (typeof fn == 'function') child.on('exit', fn);
}

function spawn_dummies(amount, fn){
	var children = spawn('node', ['./dummies.js', amount]);
	children.stderr.on('data', error);
	children.stdout.on('data', function(data){
		if (data.toString().trim() == amount){
			console.log('created', amount, 'dummies');
			console.log('\n');
			if (typeof fn == 'function') fn();
		}
	});
}

spawn_story1(function(code){
	console.log('Child process exited', code);

	spawn_dummies(200, function(){
		spawn_story1();
	});
});

var dummy = require('./dummy');

for (var i = 0; ++i <= process.argv[2];) (dummy)(i);

/*
var dummies = [];

for (var i = 0; ++i <= process.argv[2];){
	dummies.push(dummy(i));
}

process.on('exit', function(){
	for (var i = 0, len = dummies.length; i < len; i++){
		console.log(dummies[i].socket.connected);
		if (dummies[i].socket.connected) dummies[i].disconnect();
	}
});
*/

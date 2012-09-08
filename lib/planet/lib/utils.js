var sys = require('util'),
	slice = Array.prototype.slice;

var extend = exports.extend = function(a, b){
	for (var key in b) a[key] = b[key];
	return a;
};

var merge = exports.merge = function(origin){
	var extensions = slice.call(arguments, 1);
	for (var i = 0, len = extensions.length; i < len; i++) extend(origin, extensions[i]);
	return origin;
};

var log = exports.log = function(){
	sys.log.call(sys, slice.call(arguments).join(' '));
};

// extensions and registers
var	uses = exports.uses = function(){
	var args = Array.prototype.slice.call(arguments),
		matches;

	for (var i = 0, len = args.length; i < len; i++){
		var current = args[i];
		if (current instanceof Function) current(this);
		else if (typeof current == 'object' && !Array.isArray(current)){
			if (current.register) current.register(this);
			for (var key in current){
				if (typeof current[key] == 'function' && (matches = key.match(/^on(.*)$/))){
					var event = matches[1].split('');
					event[0] = event[0].toLowerCase();
					event = event.join('');
					this.addListener(event, current[key].bind(current));
				}
			}
		}
	}
	return this;
};

(function(){

var fs      = require('fs'),
	mime    = require('mime'),
	path    = require('path'),
	url     = require('url'),
	moddir  = path.dirname(module.filename),
	testdir = path.normalize(path.join(moddir, './../../../tests/'));

var getPath = exports.getPath = function(path){
	var result = url.parse(path);
	return (result.pathname) ? result.pathname : path;
};

var serveError = exports.serveError = function(res, url){
	res.writeHead(404, {'Content-Type': 'text/html'});
	res.end('<h1>Not Found</h1>\n');
	log('HTTP 404 - ', url);
};

var serveTests = exports.serveTests = function(res, path, url){
	var file = testdir + path;
	fs.stat(file, function(err, stat){
		if (err || !stat.isFile()) return serveError(res, file);
		var stream = fs.createReadStream(file);
		res.writeHead(200, {'Content-Type': mime.lookup(file)});
		// log('HTTP 200 - ', file);
		stream.addListener('data', function(chunk){
			res.write(chunk);
		});
		stream.addListener('end', function(){
			res.end();
		});
	});
};

})();

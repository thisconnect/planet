//var util = require('util'),
//	slice = Array.prototype.slice;

var isArray = Array.isArray || function(o){
	return toString.call(o) === '[object Array]';
};

var utils = module.exports = {

	isArray: isArray,

	setCharAt: function(s, i, chars){
		return s.substr(0, i) + chars + s.substr(i + chars.length);
	},

	merge: function merge(o1, o2){
		for (var p in o2) {
			o1[p] = (
				o1[p] != null
				&& o2[p] != null
				&& !isArray(o1[p])
				&& !isArray(o2[p])
				&& typeof o1[p] == 'object'
				&& typeof o2[p] == 'object'
			) ? utils.merge(o1[p], o2[p]) : o2[p];
		}
		return o1;
	},

	get: function(o, path){
		for (var i = 0, l = path.length; i < l; i++){
			if (hasOwnProperty.call(o, path[i])) o = o[path[i]];
			else return o[path[i]];
		}
		return o;
	},

	set: function(o, path, value){
		path = (typeof path == 'string') ? path.split('.') : path.slice(0);
		var key = path.pop(),
			len = path.length,
			i = 0,
			current;

		if (!(/^(string|number)$/.test(typeof key))) return null;

		while (len--){
			current = path[i++];
			o = current in o ? o[current] : (o[current] = {});
		}
		o[key] = value;
		return o;
	}

};
/*
var isArray = Array.isArray ||
	function(o){
		return toString.call(o) === '[object Array]';
	};

function setCharAt(s, i, chars){
	return s.substr(0, i) + chars + s.substr(i + chars.length);
}

var merge2 = exports.merge2 = function(o1, o2){
	for (var p in o2) {
		o1[p] = (
			o1[p] != null
			&& o2[p] != null
			&& !isArray(o1[p])
			&& !isArray(o2[p])
			&& typeof o1[p] == 'object'
			&& typeof o2[p] == 'object'
		) ? merge2(o1[p], o2[p]) : o2[p];
	}
	return o1;
};

exports.get2 = function(o, path){
	for (var i = 0, l = path.length; i < l; i++){
		if (hasOwnProperty.call(o, path[i])) o = o[path[i]];
		else return o[path[i]];
	}
	return o;
};

exports.set2 = function(o, path, value){
	path = (typeof path == 'string') ? path.split('.') : path.slice(0);
	var key = path.pop(),
		len = path.length,
		i = 0,
		current;

	if (!(/^(string|number)$/.test(typeof key))) return null;

	while (len--){
		current = path[i++];
		o = current in o ? o[current] : (o[current] = {});
	}
	o[key] = value;
	return o;
};
*/


/*
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
*/
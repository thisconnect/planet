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
			) ? merge(o1[p], o2[p]) : o2[p];
		}
		return o1;
	},

	get: function(o, path){
		for (var i = 0, l = path.length; i < l; i++){
			// setup test for this
			if (hasOwnProperty.call(o, path[i])) o = o[path[i]];
			else return o[path[i]];
		}
		return o;
	},

	set: function(o, path, value){
		path = path.slice(0);

		var key = path.pop(),
			len = path.length,
			i = 0,
			current;

		if (!(/^(string|number)$/.test(typeof key))) return null;

		while (len--){
			current = path[i++];
			if (typeof o[current] == 'string'
				&& typeof key == 'number'
				&& typeof value != 'object'
			){
				value = utils.setCharAt(o[current], key, value);
				key = current;
				break;
			}
			o = current in o ? o[current] : (o[current] = {});
			// setup test for this
			// o = hasOwnProperty.call(o, current) ? o[current] : (o[current] = {});
		}
		o[key] = value;
		return o;
	}

};

$$('select:not([multiple])').each(function(select){

	var component = select.get('name');

	select.addEvent('change', function(){
		socket.emit('set', component, select.get('value'));
	});

	socket.on('set', function(key, value){
		if (key == component){
			select.set('value', value);
		}
	});

	socket.emit('get', component, function(value){
		if (value != null){
			select.set('value', value);
		}
	});

});

$$('select[multiple]').each(function(select){

	var component = select.get('name'),
		options = select.getElements('option');

	select.addEvent('change', function(){
		socket.emit('set', component, options.get('selected'));
	});

	socket.on('set', function(key, values){
		if (key == component){
			values.each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

	socket.emit('get', component, function(values){
		if (values != null){
			values.each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

});

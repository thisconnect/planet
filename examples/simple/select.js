$$('select:not([multiple])').each(function(select){

	var component = select.get('name');

	select.addEvent('change', function(){
		socket.emit('put', component, select.get('value'));
	});

	socket.on('put', function(key, value){
		if (key == component){
			select.set('value', value);
		}
	});

	socket.once('get', function(data){
		if (component in data){
			select.set('value', data[component]);
		}
	});

});

$$('select[multiple]').each(function(select){

	var component = select.get('name'),
		options = select.getElements('option');

	select.addEvent('change', function(){
		socket.emit('put', component, options.get('selected'));
	});

	socket.on('put', function(key, values){
		if (key == component){
			values.each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

	socket.once('get', function(data){
		if (component in data){
			data[component].each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

});

$$('select').each(function(select){

	var component = select.get('name'),
		options = select.getElements('option');

	select.addEvent('change', function(){
		socket.emit('update', {
			key: component,
			value: options.get('selected')
		});
	});

	socket.on('update', function(data){
		if (component == data.key){
			data.value.each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

	socket.on('initial state', function(data){
		if (component in data){
			data[component].each(function(value, i){
				options[i].set('selected', value);
			});
		}
	});

});

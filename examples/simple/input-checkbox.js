$$('input[type=checkbox]').each(function(checkbox){

	var component = checkbox.get('name') + '.' + checkbox.get('value');

	checkbox.addEvent('change', function(){
		socket.emit('update', {
			key: component,
			value: this.get('checked')
		});
	});

	socket.on('update', function(data){
		if (component == data.key){
			checkbox.set('checked', data.value);
		}
	});

	socket.on('initial state', function(data){
		if (component in data){
			checkbox.set('checked', data[component]);
		}
	});

});

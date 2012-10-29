$$('input[type=checkbox]').each(function(checkbox){

	var component = checkbox.get('name') + '.' + checkbox.get('value');

	checkbox.addEvent('change', function(){
		socket.emit('put', component, this.get('checked'));
	});

	socket.on('put', function(key, value){
		if (key == component){
			checkbox.set('checked', value);
		}
	});

	socket.once('get', function(data){
		if (component in data){
			checkbox.set('checked', data[component]);
		}
	});

});

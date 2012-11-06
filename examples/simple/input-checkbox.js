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

	socket.emit('get', component, function(checked){
		checkbox.set('checked', checked);
	});

});

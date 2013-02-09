$$('input[type=checkbox]').each(function(checkbox){

	var component = checkbox.get('name') + '.' + checkbox.get('value');

	checkbox.addEvent('change', function(){
		socket.emit('set', component, this.get('checked'));
	});

	socket.on('set', function(key, value){
		if (key == component){
			checkbox.set('checked', value);
		}
	});

	socket.emit('get', component, function(checked){
		checkbox.set('checked', checked);
	});

});

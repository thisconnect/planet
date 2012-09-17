$$('input[type=checkbox]').each(function(checkbox){

	var component = checkbox.get('name') + '.' + checkbox.get('value');

	checkbox.addEvent('change', function(){
		socket.emit('post', component, this.get('checked'));
	});

	socket.on('post', function(key, value){
		if (key == component){
			checkbox.set('checked', value);
		}
	});

	socket.on('get', function(data){
		if (component in data){
			checkbox.set('checked', data[component]);
		}
	});

});

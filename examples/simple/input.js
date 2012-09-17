$$('input[type=text], input[type=number], input[type=range], textarea').each(function(input){

	var component = input.get('tag') + '.' + input.get('name');

	input.addEvent('change', function(){
		socket.emit('post', component, this.get('value'));
	});

	if (input.get('tag') == 'textarea') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'text') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	socket.on('post', function(key, value){
		if (key == component){
			input.set('value', value);
		}
	});

	socket.once('get', function(data){
		if (component in data){
			input.set('value', data[component]);
		}
	});

});

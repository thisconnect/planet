$$('input[type=text], input[type=number], input[type=range], textarea').each(function(input){

	var component = input.get('tag') + '.' + input.get('name');

	input.addEvent('change', function(){
		socket.emit('update', {
			key: component,
			value: this.get('value')
		});
	});

	if (input.get('tag') == 'textarea') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'text') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	socket.on('update', function(data){
		if (component == data.key){
			input.set('value', data.value);
		}
	});

	socket.on('initial state', function(data){
		if (component in data){
			input.set('value', data[component]);
		}
	});

});
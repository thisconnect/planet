$$('input[type=text], input[type=number], select[multiple!=multiple], textarea').each(function(input){

	var state = null,
		component = input.get('tag') + '.' + input.get('name');

	input.addEvents({

		'focus': function(){
			socket.emit('acquire lock', component);
		},

		'change': function(){
			// store value if lock not yet aquired
			if (state != 'acquired') state = this.get('value');
			else socket.emit('update', {
				key: component,
				value: this.get('value')
			});
		},

		'blur': function(){
			if (state == 'acquired') socket.emit('release lock', component);
		}

	});

	if (input.get('tag') == 'textarea') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'text') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'number') input.addListener('input', function(){
		input.fireEvent('focus');
	});

	socket.on('lock acquired', function(data){
		if (component == data){
			state = 'acquired';
		}
	});

	socket.on('lock key', function(data){
		if (component == data){
			input.addClass('locked');
			state = 'locked';
		}
	});

	socket.on('lock released', function(data){
		if (component == data){
			input.removeClass('locked');
			state = null;
		}
	});

	socket.on('release key', function(data){
		if (component == data){
			input.removeClass('locked');
			state = null;
		}
	});

	socket.on('update', function(data){
		if (data.key == component && state != 'acquired'){
			input.set('value', data.value);
			input.addClass('updated');
			(function(){
				input.removeClass('updated');
			}).delay(200);
		}
	});

});

(function(){

// ui elements supporting focus/change/blur events
// and getting and setting 'name' and 'value'

$$('input[type=text], input[type=number], input[type=range], select[multiple!=multiple], textarea').each(function(input){

	var state = null,
		component = input.get('tag') + '.' + input.get('name');

	input.addEvents({

		'focus': function(){
			socket.send(JSON.stringify({
				type: 'acquire_lock',
				payload: component
			}));
		},

		'change': function(){
			// store value if lock not yet aquired
			if (state != 'acquired') state = this.get('value');
			else socket.send(JSON.stringify({
				type: 'state_update',
				payload: {
					component: component,
					payload: this.get('value')
				}
			}));
		},

		'blur': function(){
			if (state == 'acquired') socket.send(JSON.stringify({
				type: 'release_lock',
				payload: component
			}));
		}

	});

	if (input.get('tag') == 'textarea') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'text') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'range') input.addEvent('mousedown', function(){
		input.fireEvent('focus');
	});

	if (input.get('type') == 'number') input.addListener('input', function(){
			console.log('input');
	});

	socket.addListener('message', function(data){
		data = JSON.parse(data);

		var payload = data.payload;

		if (payload[component] != null){

			if (data.type == 'initial_state'){
				input.set('value', payload[component]);
			}

			if (data.type == 'state_update' && state != 'acquired'){
				input.set('value', payload[component]).addClass('updated');
				(function(){ input.removeClass('updated'); }).delay(200);
			}
		}

		if (payload != component) return;

		if (data.type == 'lock_acquired') state = 'acquired';

		if (data.type == 'lock_component'){
			input.addClass('locked');
			state = 'locked';
		}

		if (data.type == 'lock_released') state = null;

		if (data.type == 'release_component'){
			input.removeClass('locked');
			state = null;
		}

	});

});

})();

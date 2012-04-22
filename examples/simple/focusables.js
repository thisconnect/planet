(function(){


// ui elements supporting focus/change/blur events
// and getting and setting 'name' and 'value'

$$('input[type=text], input[type=number], input[type=range], select, textarea').each(function(input){

	var state = null,
		component = input.get('tag') + '.' + input.get('name');
	
	input.addEvents({

		'change': function(){
			socket.send(JSON.stringify({
				type: 'state_update',
				payload: {
					component: component,
					payload: this.get('value')
				}
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
			
			if (data.type == 'state_update'){
				input.set('value', payload[component]).addClass('updated');
				(function(){ input.removeClass('updated'); }).delay(200);
			}
		}
		
	});

});


})();


(function(){

$$('input[type=text], input[type=number], input[type=range], textarea').each(function(input){

	var component = input.get('tag') + '.' + input.get('name');

	input.addEvent('change', function(){
		socket.send(JSON.stringify({
			type: 'attempt_update',
			payload: {
				component: component,
				payload: this.get('value')
			}
		}));
	});

	if (input.get('tag') == 'textarea') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	if (input.get('type') == 'text') input.addEvent('keyup', function(){
		input.fireEvent('change');
	});

	socket.addListener('message', function(data){
		data = JSON.parse(data);
		var payload = data.payload;

		if (payload[component] != null){
			if (data.type == 'initial_state'){
				input.set('value', payload[component]);
			}

			if (data.type == 'state_update'){
				input.set('value', payload[component]);
			}
		}
	});

});

})();

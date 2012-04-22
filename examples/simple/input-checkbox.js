$$('input[type=checkbox]').each(function(checkbox){

	var component = checkbox.get('name') + '.' + checkbox.get('value');

	checkbox.addEvent('change', function(){
		socket.send(JSON.stringify({
			type: 'attempt_update',
			payload: {
				component: component,
				payload: this.get('checked')
			}
		}));
	});

	socket.addListener('message', function(data){
		data = JSON.parse(data);

		var payload = data.payload[component];
		if (payload == null) return;

		if (data.type == 'initial_state') checkbox.set('checked', payload);

		if (data.type == 'state_update'){
			if (checkbox.get('checked') != payload){
				checkbox.set('checked', payload);
			}
		}
	});

});

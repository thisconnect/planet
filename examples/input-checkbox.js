
/*
$$('input[type=checkbox]').addEvent('change', function(){
	socket.send(JSON.stringify({
		type: 'attempt_update',
		payload: {
			component: JSON.stringify({
				'name': this.get('name'),
				'value': this.get('value')
			}),
			payload: {
				'checked': this.get('checked')
			}
		}
	}));
});

socket.addListener('message', function(data){
	data = JSON.parse(data);
	if (data.type != 'state_update') return;
	
	Object.each(data.payload, function(value, key){
		var keys = JSON.parse(key),
			checkbox = document.getElement('input[name={name}][value={value}]'.substitute({
				'name': keys.name,
				'value': keys.value
			}));
		
		if (checkbox.get('checked') != value['checked']) checkbox.set('checked', value['checked']);
	});
	
});
*/

$$('input[type=checkbox]').each(function(checkbox){

	var label = checkbox.getParent('label'),
		component = checkbox.get('name') + '.' + checkbox.get('value');
	
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
				label.addClass('updated');
				(function(){ label.removeClass('updated'); }).delay(200);
			}
		}
	});
	
});


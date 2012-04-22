(function(){

document.getElements('select').each(function(select){

	var component = select.get('name'),
		options = select.getElements('option');

	select.addEvent('change', function(){
		socket.send(JSON.stringify({
			type: 'attempt_update',
			payload: {
				component: component,
				payload: options.get('selected')
			}
		}));
	});

	socket.addListener('message', function(data){
		data = JSON.parse(data);
		
		var payload = data.payload;

		if (payload[component] != null){
			if (data.type == 'initial_state' || data.type == 'state_update'){
				payload[component].each(function(value, index){
					options[index].set('selected', value);
				});
			}
		}
	});

});

})();

(function(){

var radios = $$('input[type=radio][name=spice]'),
	values = radios.get('value');

radios.addEvent('change', function(){

	socket.send(JSON.stringify({
		type: 'attempt_update',
		payload: {
			component: 'radio',
			payload: this.get('value')
		}
	}));

});
	
socket.addListener('message', function(data){
	data = JSON.parse(data);
	
	var payload = data.payload['radio'];
	if (payload == null) return;
	
	var radio = radios[values.indexOf(payload)],
		label = radio.getParent('label');
	
	if (data.type == 'initial_state') radio.set('checked', true);
	
	if (data.type == 'state_update' && !radio.get('checked')){
		radio.set('checked', true);
		label.addClass('updated');
		(function(){ label.removeClass('updated'); }).delay(200);
	}
	
});

})();
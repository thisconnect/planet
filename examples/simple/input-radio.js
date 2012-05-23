(function(){

	var radios = $$('input[type=radio][name=spice]'),
		values = radios.get('value');

	radios.addEvent('change', function(){
		socket.emit('update', {
			key: 'spice',
			value: this.get('value')
		});
	});

	socket.on('update', function(data){
		if (data.key == 'spice'){
			radios[values.indexOf(data.value)].set('checked', true);
		}
	});

	socket.on('initial state', function(data){
		if ('spice' in data){
			radios[values.indexOf(data.spice)].set('checked', true);
		}
	});

})();
(function(){

	var radios = $$('input[type=radio][name=spice]'),
		values = radios.get('value');

	radios.addEvent('change', function(){
		socket.emit('post', 'spice', this.get('value'));
	});

	socket.on('post', function(key, value){
		if (key == 'spice'){
			radios[values.indexOf(value)].set('checked', true);
		}
	});

	socket.on('get', function(data){
		if ('spice' in data){
			radios[values.indexOf(data['spice'])].set('checked', true);
		}
	});

})();
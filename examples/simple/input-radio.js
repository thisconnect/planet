(function(){

	var radios = $$('input[type=radio][name=herb]'),
		values = radios.get('value');

	radios.addEvent('change', function(){
		socket.emit('put', 'herb', this.get('value'));
	});

	socket.on('put', function(key, value){
		if (key == 'herb'){
			radios[values.indexOf(value)].set('checked', true);
		}
	});

	socket.once('get', function(data){
		if ('herb' in data){
			radios[values.indexOf(data['herb'])].set('checked', true);
		}
	});

})();
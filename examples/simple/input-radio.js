(function(){

	var radios = $$('input[type=radio][name=herb]'),
		values = radios.get('value');

	radios.addEvent('change', function(){
		socket.emit('set', 'herb', this.get('value'));
	});

	socket.on('set', function(key, value){
		if (key == 'herb'){
			radios[values.indexOf(value)].set('checked', true);
		}
	});

	socket.emit('get', 'herb', function(herb){
		if (herb != null){
			radios[values.indexOf(herb)].set('checked', true);
		}
	});

})();
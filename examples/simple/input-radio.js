(function(){

	var radios = $$('input[type=radio][name=herb]'),
		values = radios.get('value');

	radios.addEvent('change', function(){
		socket.emit('post', 'herb', this.get('value'));
	});

	socket.on('post', function(key, value){
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
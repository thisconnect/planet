(function(){

var state = null,
	multiselect = document.getElement('select[multiple]'),
	options = multiselect.getElements('option');

multiselect.addEvents({

	'focus': function(){
		socket.emit('acquire lock', 'multiselect');
	},
	
	'change': function(){
		if (state != 'acquired') state = options.get('selected');
		else socket.emit('update', {
			key: 'multiselect',
			value: options.get('selected')
		});
	},
	
	'blur': function(){
		if (state == 'acquired') socket.emit('release lock', 'multiselect');
	}
	
});

function select(value, index){
	options[index].set('selected', value);
}

socket.on('update', function(data){

});

socket.on('update', function(data){

});

socket.on('update', function(data){
	if (data.key == 'multiselect' && state != 'acquired'){
		data.value.each(select);
		multiselect.addClass('updated');
		(function(){
			multiselect.removeClass('updated');
		}).delay(200);
	}
});

socket.on('lock acquired', function(data){
	if (data == 'multiselect'){
		state = 'acquired';
	}
});

socket.on('lock released', function(data){
	if (data == 'multiselect'){
		state = null;
	}
});

socket.on('release key', function(data){
	if (data == 'multiselect'){
		multiselect.removeClass('locked');
		state = null;
	}
});

socket.on('initial state', function(data){
	if ('multiselect' in data){
		data.multiselect.each(select);
	}
});

})();

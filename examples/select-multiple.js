(function(){

var state = null;

var multiselect = document.getElement('select[multiple]'),
	options = multiselect.getElements('option');

multiselect.addEvents({

	'focus': function(){
		socket.send(JSON.stringify({
			type: 'acquire_lock',
			payload: 'multiselect'
		}));
	},
	
	'change': function(){
		if (state != 'acquired') state = options.get('selected');
		else socket.send(JSON.stringify({
			type: 'state_update',
			payload: {
				component: 'multiselect',
				payload: options.get('selected')
			}
		}));
	},
	
	'blur': function(){
		if (state == 'acquired') socket.send(JSON.stringify({
			type: 'release_lock',
			payload: 'multiselect'
		}));
	}
	
});

function select(value, index){
	options[index].set('selected', value);
}


socket.addListener('message', function(data){
	data = JSON.parse(data);
	
	var payload = data.payload;
	
	if (payload['multiselect'] != null){
		
		if (data.type == 'initial_state'){
			payload['multiselect'].each(select);
		}
		
		if (data.type == 'state_update' && state != 'acquired'){
			payload['multiselect'].each(select);
			multiselect.addClass('updated');
			(function(){ multiselect.removeClass('updated'); }).delay(200);
		}
		
	}
	
	if (payload != 'multiselect') return;
	
	if (data.type == 'lock_acquired') state = 'acquired';

	if (data.type == 'lock_component'){
		multiselect.addClass('locked');
		state = 'locked';
	}
	
	if (data.type == 'lock_released') state = null;
	
	if (data.type == 'release_component'){
		multiselect.removeClass('locked');
		state = null;
	}
	
});


})();


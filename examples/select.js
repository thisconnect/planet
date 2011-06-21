/*
(function(){

var state = null;

var selectbox = document.getElement('select');

selectbox.addEvents({
	'focus': function(){
		socket.send(JSON.stringify({
			type: 'acquire_lock',
			payload: 'selectbox'
		}));
	},
	'change': function(){
		if (state != 'acquired') state = this.get('value');
		else socket.send(JSON.stringify({
			type: 'state_update',
			payload: {
				component: 'selectbox',
				payload: this.get('value')
			}
		}));
	},
	'blur': function(){
		if (state == 'acquired') socket.send(JSON.stringify({
			type: 'release_lock',
			payload: 'selectbox'
		}));
		state = null;
	}
});

socket.addListener('message', function(data){
	data = JSON.parse(data);
	
	var payload = data.payload;
	
	if (payload['selectbox'] != null){
		
		if (data.type == 'initial_state'){
			selectbox.set('value', payload['selectbox']);
		}
		
		if (data.type == 'state_update'){
			selectbox.set('value', payload['selectbox']);
		}
		
	}
	
	if (payload != 'selectbox') return;
	
	if (data.type == 'lock_acquired'){
		state = 'acquired';
	}
	
	if (data.type == 'lock_released'){
		console.log('lock_released');
	}
	
	if (data.type == 'release_component'){
		console.log('release component');
	}
	
});


})();
*/

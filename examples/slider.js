(function(){

var state = null;

var mySlider = window.mySlider = new Slider($('slider'), $('knob'), {
	offset: -2,
	onChange: function(step){
		if (state != 'acquired') state = step;
		else socket.send(JSON.stringify({
			type: 'state_update',
			payload: {
				component: 'slider',
				payload: step
			}
		}));
		
	},
	onComplete: function(step){
		// console.log('complete', state);
		if (state != 'acquired') return;
		socket.send(JSON.stringify({
			type: 'release_lock',
			payload: 'slider'
		}));
		state = null;
	}
});

mySlider.element.addEvent('mousedown', function(){
	// console.log('mousedown', state);
	
	// onInit More Slider fires change 
	// so state will be 0. 
	// when start dragging (on mousedown)
	// slider doesn't fire change
	// that's why we need to set state to the current step  
	state = mySlider.step;
	
	if (state != 'locked') socket.send(JSON.stringify({
		type: 'acquire_lock',
		payload: 'slider'
	}));
	
});


socket.on('message', function(data){
	data = JSON.parse(data);
	// console.log(data.type, data.payload);
/*
			case 'initial_state':
			case 'state_update':
			case 'lock_acquired':
			case 'lock_component':
			case 'lock_released':
			case 'release_component':
*/
	
	if (data.type == 'state_update'){
		if (data.payload['slider'] == null) return;
		// console.log(data.payload['slider']);
		
		// prevent slider updating if this client is sending
		if (state != 'acquired'){
			mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
			mySlider.step = data.payload['slider'];
		}
		// can't use mySlider.set because that fires change
	}
		
	
	if (data.type == 'initial_state'){
		if (data.payload['slider'] == null) return;
		mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
		mySlider.step = data.payload['slider'];
	}
	
	
	
	if (data.payload != 'slider') return;
	
	if (data.type == 'lock_acquired'){
		// send the current value when lock_acquired
		if (typeof state == 'number') socket.send(JSON.stringify({
			type: 'state_update',
			payload: {
				component: 'slider',
				payload: state
			}
		}));
		state = 'acquired';
	}
	
	if (data.type == 'lock_released'){
		state = null;
	}
	
	if (data.type == 'lock_component'){
		mySlider.detach();
		state = 'locked';
	}
	
	if (data.type == 'lock_released'){
		state = null;
	}
	
	if (data.type == 'release_component'){
		mySlider.attach();
		state = null;
	}
	
	if (data.type == 'acquire_lock_error'){
		console.log('acquire_lock_error');
	}
	

});


})();




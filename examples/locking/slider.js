(function(){

var state = null;

var mySlider = new Slider($('slider'), $('knob'), {
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
		if (state != 'acquired') return;
		socket.send(JSON.stringify({
			type: 'release_lock',
			payload: 'slider'
		}));
		state = null;
	}
});

mySlider.element.addEvent('mousedown', function(){
	state = mySlider.step;

	if (state != 'locked') socket.send(JSON.stringify({
		type: 'acquire_lock',
		payload: 'slider'
	}));
});

socket.on('message', function(data){
	data = JSON.parse(data);
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

		if (state != 'acquired'){
			mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
			mySlider.step = data.payload['slider'];
		}
	}

	if (data.type == 'initial_state'){
		if (data.payload['slider'] == null) return;
		mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
		mySlider.step = data.payload['slider'];
	}

	if (data.payload != 'slider') return;

	if (data.type == 'lock_acquired'){
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


(function(){

var mySlider = new Slider($('slider'), $('knob'), {
	offset: -2,
	onChange: function(step){
		socket.send(JSON.stringify({
			type: 'attempt_update',
			payload: {
				component: 'slider',
				payload: step
			}
		}));
	}
});

mySlider.element.addEvent('mousedown', function(){
	socket.send(JSON.stringify({
		type: 'attempt_update',
		payload: {
			component: 'slider',
			payload: mySlider.step
		}
	}));
});

socket.on('message', function(data){
	data = JSON.parse(data);

	if (data.payload['slider'] == null) return;

	if (data.type == 'state_update'){
		mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
		mySlider.step = data.payload['slider'];
	}

	if (data.type == 'initial_state'){
		mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
		mySlider.step = data.payload['slider'];
	}
});

})();

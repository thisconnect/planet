(function(){

var mySlider = new Slider($('slider'), $('knob'), {
	offset: -2
});

mySlider.addEvent('change', function(step){
	socket.send(JSON.stringify({
		type: 'attempt_update',
		payload: {
			component: 'slider',
			payload: step
		}
	}));
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

	if (data.type == 'state_update' || data.type == 'initial_state'){
	console.log('slider', data.payload['slider']);
		mySlider.setKnobPosition(mySlider.toPosition(data.payload['slider']));
		mySlider.step = data.payload['slider'];
	}

});

})();

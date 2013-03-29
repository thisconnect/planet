(function(){

	var mySlider = new Slider('slider', 'knob', {
		offset: -2
	});

	mySlider.addEvent('change', function(step){
		socket.emit('set', 'slider', step);
	});

	mySlider.element.addEvent('mousedown', function(){
		socket.emit('set', 'slider', mySlider.step);
	});

	socket.on('set', function(key, value){
		if (key == 'slider'){
			mySlider.setKnobPosition(mySlider.toPosition(value));
			mySlider.step = value;
		}
	});

	socket.emit('get', 'slider', function(value){
		mySlider.setKnobPosition(mySlider.toPosition(value));
		mySlider.step = value;
	});

})();

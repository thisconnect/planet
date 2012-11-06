(function(){

	var mySlider = new Slider('slider', 'knob', {
		offset: -2
	});

	mySlider.addEvent('change', function(step){
		socket.emit('put', 'slider', step);
	});

	mySlider.element.addEvent('mousedown', function(){
		socket.emit('put', 'slider', mySlider.step);
	});

	socket.on('put', function(key, value){
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

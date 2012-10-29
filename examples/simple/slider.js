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

	socket.once('get', function(data){
		if ('slider' in data){
			mySlider.setKnobPosition(mySlider.toPosition(data.slider));
			mySlider.step = data.slider;
		}
	});

})();

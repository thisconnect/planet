(function(){

	var mySlider = new Slider('slider', 'knob', {
		offset: -2
	});

	mySlider.addEvent('change', function(step){
		socket.emit('post', 'slider', step);
	});

	mySlider.element.addEvent('mousedown', function(){
		socket.emit('post', 'slider', mySlider.step);
	});

	socket.on('post', function(key, value){
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
